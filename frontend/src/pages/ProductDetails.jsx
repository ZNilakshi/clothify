import {
    Box, Typography, Snackbar, Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Add, Remove, ShoppingCart, ArrowBack, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductSection from "../components/home/ProductSection";
import productService from "../services/productService";
import axios from "axios";
import authService from "../services/authService";

/* ══════════════════════════════════════════════════════════════
   CONFIG  (unchanged)
══════════════════════════════════════════════════════════════ */
const API = "http://localhost:8080";
const getUser    = () => authService.getCurrentUser();
const getHeaders = () => { const u=getUser(); return u?.token?{Authorization:`Bearer ${u.token}`}:{}; };

const CART_QTY_KEY = "clothify_cart_qty";
const CART_IDS_KEY = "clothify_cart_ids";
const loadLocalCartQty = () => { try{return JSON.parse(localStorage.getItem(CART_QTY_KEY))||{};}catch{return{};} };
const saveLocalCartQty = (m) => { try{localStorage.setItem(CART_QTY_KEY,JSON.stringify(m));}catch{} };
const loadLocalCartIds = () => { try{return JSON.parse(localStorage.getItem(CART_IDS_KEY))||{};}catch{return{};} };
const saveLocalCartIds = (m) => { try{localStorage.setItem(CART_IDS_KEY,JSON.stringify(m));}catch{} };

const COLOR_HEX = {
    BLACK:"#000000",WHITE:"#FFFFFF",RED:"#EF4444",BLUE:"#3B82F6",
    GREEN:"#22C55E",YELLOW:"#EAB308",PURPLE:"#A855F7",PINK:"#EC4899",
    ORANGE:"#F97316",GRAY:"#6B7280",BROWN:"#92400E",NAVY:"#1E3A5F",
};

/* ══════════════════════════════════════════════════════════════
   FONTS & KEYFRAMES
══════════════════════════════════════════════════════════════ */
if (!document.head.querySelector('link[href*="Playfair"]')) {
    const l=document.createElement("link"); l.rel="stylesheet";
    l.href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
}
if (!document.head.querySelector("#pd-atelier")) {
    const s=document.createElement("style"); s.id="pd-atelier";
    s.textContent=`
        @keyframes atFadeUp   {from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes atFadeIn   {from{opacity:0}to{opacity:1}}
        @keyframes atImgIn    {from{transform:scale(1.06)}to{transform:scale(1)}}
        @keyframes atSpin     {to{transform:rotate(360deg)}}
        @keyframes atBlink    {0%,100%{opacity:1}50%{opacity:0.25}}
        @keyframes atMarquee  {from{transform:translateX(0)}to{transform:translateX(-50%)}}
        /* Slide-fill hover effect on primary button */
        .at-btn-solid{position:relative;overflow:hidden;}
        .at-btn-solid::after{content:'';position:absolute;inset:0;background:#fff;transform:translateX(-101%);transition:transform 0.38s cubic-bezier(.77,0,.18,1);}
        .at-btn-solid:hover::after{transform:translateX(0);}
        .at-btn-solid .at-lbl,.at-btn-solid .at-ico{position:relative;z-index:1;transition:color 0.15s;}
        .at-btn-solid:hover .at-lbl,.at-btn-solid:hover .at-ico{color:#000!important;}
        /* Inverse fill on outline button */
        .at-btn-outline{position:relative;overflow:hidden;}
        .at-btn-outline::after{content:'';position:absolute;inset:0;background:#000;transform:translateX(-101%);transition:transform 0.32s cubic-bezier(.77,0,.18,1);}
        .at-btn-outline:hover::after{transform:translateX(0);}
        .at-btn-outline .at-lbl,.at-btn-outline .at-ico{position:relative;z-index:1;transition:color 0.15s;}
        .at-btn-outline:hover .at-lbl,.at-btn-outline:hover .at-ico{color:#fff!important;}
        /* Thumb hover zoom */
        .at-thumb img{transition:transform 0.38s ease;}
        .at-thumb:hover img{transform:scale(1.1);}
    `;
    document.head.appendChild(s);
}

const theme = createTheme({ palette:{mode:"light",primary:{main:"#000"}}, typography:{fontFamily:"'IBM Plex Mono',monospace"} });
const mono  = "'IBM Plex Mono',monospace";
const serif = "'Playfair Display',serif";

/* ══════════════════════════════════════════════════════════════
   HELPERS  (logic unchanged)
══════════════════════════════════════════════════════════════ */
const resolveUrl    = (url)=>{ if(!url)return null; if(url.startsWith("http"))return url; return`${API}${url.startsWith("/")?url:`/${url}`}`; };
const collectImages = (p)=>{ const imgs=[]; const push=(u)=>{const r=resolveUrl(u);if(r&&!imgs.includes(r)&&imgs.length<6)imgs.push(r);}; push(p.imageUrl);[p.imageUrl2,p.imageUrl3,p.imageUrl4,p.imageUrl5,p.imageUrl6].forEach(push);[p.image2,p.image3,p.image4,p.image5,p.image6].forEach(push);if(Array.isArray(p.images))p.images.forEach(push);if(Array.isArray(p.imageUrls))p.imageUrls.forEach(push);return imgs; };
const normalize     = (s)=>{ if(!s)return null; return String(s).trim().toUpperCase(); };
const getItemColor  = (i)=>normalize(i.color??i.selectedColor??i.variant?.color??i.product?.color??i.colorName??i.colorCode??null);
const getItemSize   = (i)=>normalize(i.size??i.selectedSize??i.variant?.size??i.product?.size??i.sizeName??i.sizeCode??null);
const getItemPid    = (i)=>i.productId??i.product?.productId??i.product?.id??i.pid??null;
const makeVK        = (pid,c,s)=>`${pid}__${normalize(c)??""}__${normalize(s)??""}`;
const deepVals      = (obj,d=0)=>{ if(d>4||!obj||typeof obj!=="object")return[]; return Object.values(obj).flatMap(v=>{ if(typeof v==="string")return[v.trim().toUpperCase()]; if(typeof v==="object"&&v!==null)return deepVals(v,d+1); return[]; }); };
const getInCartQty  = (items,pid,c,s)=>{ if(!items?.length)return 0; const nc=normalize(c),ns=normalize(s); return items.filter(it=>{ const p=getItemPid(it),ic=getItemColor(it),is=getItemSize(it); if(p!==pid)return false; if(nc&&ns){if(ic===nc&&is===ns)return true; const v=deepVals(it);return v.includes(nc)&&v.includes(ns);} return !ic&&!is; }).reduce((s2,it)=>s2+(it.quantity??1),0); };
const findCartItem  = (items,pid,c,s)=>{ if(!items?.length)return null; const nc=normalize(c),ns=normalize(s); const fast=items.find(it=>{ const p=getItemPid(it),ic=getItemColor(it),is=getItemSize(it); if(p!==pid)return false; if(nc&&ns)return ic===nc&&is===ns; return !ic&&!is; }); if(fast)return fast; if(nc&&ns){const deep=items.find(it=>{ const p=getItemPid(it);if(p!==pid)return false; const v=deepVals(it);return v.includes(nc)&&v.includes(ns); });if(deep)return deep;} const byP=items.filter(it=>getItemPid(it)===pid); if(byP.length===1)return byP[0]; return null; };

/* ══════════════════════════════════════════════════════════════
   DESIGN ATOMS
══════════════════════════════════════════════════════════════ */
const ML = ({children,sx={}})=>(
    <Typography sx={{fontFamily:mono,fontSize:9,fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",color:"#999",lineHeight:1.4,...sx}}>
        {children}
    </Typography>
);
const HR = ({label,sx={}})=>(
    <Box sx={{display:"flex",alignItems:"center",gap:2,...sx}}>
        {label&&<ML sx={{flexShrink:0}}>{label}</ML>}
        <Box sx={{flex:1,height:"1px",backgroundColor:"#e8e8e8"}}/>
    </Box>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const ProductDetails = ()=>{
    const {id}=useParams(); const navigate=useNavigate();

    const [product,          setProduct]         = useState(null);
    const [loading,          setLoading]         = useState(true);
    const [relatedProducts,  setRelatedProducts] = useState([]);
    const [images,           setImages]          = useState([]);
    const [activeImg,        setActiveImg]       = useState(0);
    const [selectedColor,    setSelectedColor]   = useState(null);
    const [selectedSize,     setSelectedSize]    = useState(null);
    const [quantity,         setQuantity]        = useState(1);
    const [cartItems,        setCartItems]       = useState([]);
    const [addingToCart,     setAddingToCart]    = useState(false);
    const [localCartQty,     setLocalCartQty]    = useState(()=>loadLocalCartQty());
    const [localCartIds,     setLocalCartIds]    = useState(()=>loadLocalCartIds());
    const [snackbar,         setSnackbar]        = useState({open:false,message:"",severity:"success"});

    const updateLCQ = useCallback((u)=>{ setLocalCartQty(p=>{ const n=typeof u==="function"?u(p):u; saveLocalCartQty(n); return n; }); },[]);
    const updateLCI = useCallback((u)=>{ setLocalCartIds(p=>{ const n=typeof u==="function"?u(p):u; saveLocalCartIds(n); return n; }); },[]);

    const fetchCart = useCallback(async()=>{
        const user=getUser(); if(!user?.customerId)return[];
        try{
            const res=await axios.get(`${API}/api/cart/customer/${user.customerId}`,{headers:getHeaders()});
            const data=res.data; const items=Array.isArray(data)?data:(data.items??data.cartItems??data.cart??[]);
            setCartItems(items);
            if(items.length>0){
                const sq={},si={};
                items.forEach(it=>{const pid=getItemPid(it),c=getItemColor(it),s=getItemSize(it),k=makeVK(pid,c,s),id2=it.cartItemId??it.id; sq[k]=(sq[k]??0)+(it.quantity??1); if(id2)si[k]=id2;});
                updateLCQ(p=>{const m={...p};Object.entries(sq).forEach(([k,v])=>{m[k]=Math.max(m[k]??0,v);});return m;});
                updateLCI(p=>({...p,...si}));
            } else { updateLCQ({}); updateLCI({}); }
            return items;
        }catch{return[];}
    },[]);

    const fetchProduct = async()=>{
        try{
            const data=await productService.getProductById(id);
            setProduct(data); setImages(collectImages(data));
            if(data.variants?.length>0){const f=data.variants.find(v=>v.quantity>0)||data.variants[0]; setSelectedColor(f.color); setSelectedSize(f.size);}
            const all=await productService.getActiveProducts();
            setRelatedProducts(all.filter(p=>p.categoryId===data.categoryId&&p.productId!==data.productId).slice(0,10));
        }catch(e){console.error(e);}finally{setLoading(false);}
    };

    useEffect(()=>{fetchProduct();},[id]);
    useEffect(()=>{fetchCart(); const h=()=>fetchCart(); window.addEventListener("cartUpdated",h); return()=>window.removeEventListener("cartUpdated",h);},[fetchCart]);

    const productId     = product?.productId||product?.id;
    const hasVariants   = product?.variants?.length>0;
    const availColors   = [...new Set((product?.variants||[]).map(v=>v.color))];
    const availSizes    = !hasVariants||!selectedColor?[]:product.variants.filter(v=>v.color===selectedColor).map(v=>v.size);
    const variantStock  = !product?0:!hasVariants?(product.stockQuantity||0):(!selectedColor||!selectedSize)?0:(product.variants.find(v=>v.color===selectedColor&&v.size===selectedSize)?.quantity||0);
    const vk            = makeVK(productId,selectedColor,selectedSize);
    const serverQty     = !product?0:hasVariants&&selectedColor&&selectedSize?getInCartQty(cartItems,productId,selectedColor,selectedSize):!hasVariants?getInCartQty(cartItems,productId,null,null):0;
    const inCartQty     = Math.max(serverQty,localCartQty[vk]??0);
    const availToAdd    = Math.max(0,variantStock-inCartQty);
    const cantAdd       = hasVariants&&(!selectedColor||!selectedSize);
    const hasDiscount   = product?.discount&&parseFloat(product.discount)>0;
    const origPrice     = parseFloat(product?.sellingPrice||product?.price||0);
    const finalPrice    = hasDiscount&&product?.discountPrice?parseFloat(product.discountPrice):origPrice;

    useEffect(()=>{ if(quantity>availToAdd&&availToAdd>0)setQuantity(availToAdd); if(availToAdd===0)setQuantity(1); },[availToAdd]);

    const handleQtyChange   = (d)=>{ const n=quantity+d; if(n>=1&&n<=availToAdd)setQuantity(n); };
    const handleColorSelect = (c)=>{ setSelectedColor(c); const sz=product.variants.filter(v=>v.color===c).map(v=>v.size); if(!sz.includes(selectedSize)){const f=product.variants.find(v=>v.color===c&&v.quantity>0); setSelectedSize(f?f.size:sz[0]);} setQuantity(1); };
    const handleSizeSelect  = (s)=>{ setSelectedSize(s); setQuantity(1); };

    const handleAddToCart = async()=>{
        if(addingToCart)return;
        if(hasVariants&&(!selectedColor||!selectedSize)){setSnackbar({open:true,message:"Select colour and size",severity:"warning"});return;}
        const user=getUser(); if(!user){setSnackbar({open:true,message:"Please log in",severity:"error"});return;}
        if(availToAdd<=0){setSnackbar({open:true,message:"Max quantity reached",severity:"warning"});return;}
        const qty=Math.min(quantity,availToAdd); setAddingToCart(true);
        updateLCQ(p=>({...p,[vk]:(p[vk]??0)+qty}));
        try{
            const res=await axios.post(`${API}/api/cart/customer/${user.customerId}/add`,{productId,quantity:qty,color:selectedColor||null,size:selectedSize||null},{headers:getHeaders()});
            const rd=res.data; const rid=rd?.cartItemId??rd?.id??rd?.itemId??rd?.item?.cartItemId??rd?.item?.id??rd?.cartItem?.cartItemId??rd?.data?.cartItemId??null;
            if(rid)updateLCI(p=>({...p,[vk]:rid}));
            await fetchCart(); window.dispatchEvent(new Event("cartUpdated"));
            setSnackbar({open:true,message:`Added — ${hasVariants&&selectedColor&&selectedSize?`${selectedColor} / ${selectedSize}`:product.productName}`,severity:"success"});
            setQuantity(1);
        }catch(e){
            updateLCQ(p=>({...p,[vk]:Math.max(0,(p[vk]??0)-qty)}));
            setSnackbar({open:true,message:e.response?.data?.message||"Failed to add",severity:"error"});
        }finally{setAddingToCart(false);}
    };

    const handleUpdateQty = async(delta)=>{
        const user=getUser(); if(!user?.customerId)return;
        let fresh=cartItems,item=findCartItem(fresh,productId,selectedColor,selectedSize);
        if(!item){fresh=await fetchCart();item=findCartItem(fresh,productId,selectedColor,selectedSize);}
        const cid=item?.cartItemId??item?.id??item?.itemId??item?.cart_item_id??localCartIds[vk]??null;
        if(!cid){setSnackbar({open:true,message:"Cart item not found",severity:"error"});return;}
        const cur=item?.quantity??inCartQty,nq=cur+delta;
        if(nq>variantStock){setSnackbar({open:true,message:`Only ${variantStock} in stock`,severity:"warning"});return;}
        if(nq<=0){
            updateLCQ(p=>({...p,[vk]:0}));
            try{await axios.delete(`${API}/api/cart/customer/${user.customerId}/item/${cid}`,{headers:getHeaders()});updateLCI(p=>{const n={...p};delete n[vk];return n;});await fetchCart();window.dispatchEvent(new Event("cartUpdated"));setSnackbar({open:true,message:"Removed from cart",severity:"success"});}
            catch{updateLCQ(p=>({...p,[vk]:cur}));setSnackbar({open:true,message:"Failed to remove",severity:"error"});}
        } else {
            updateLCQ(p=>({...p,[vk]:nq}));
            try{await axios.put(`${API}/api/cart/customer/${user.customerId}/item/${cid}`,null,{params:{quantity:nq},headers:getHeaders()});await fetchCart();window.dispatchEvent(new Event("cartUpdated"));}
            catch{updateLCQ(p=>({...p,[vk]:cur}));setSnackbar({open:true,message:"Failed to update",severity:"error"});}
        }
    };

    /* ══ LOADING ══ */
    if(loading) return(
        <ThemeProvider theme={theme}>
            <Box sx={{minHeight:"100vh",backgroundColor:"#f5f5f0"}}><Navbar/>
                <Box sx={{display:"flex",alignItems:"center",justifyContent:"center",height:"80vh"}}>
                    <Box sx={{textAlign:"center"}}>
                        <Box sx={{width:30,height:30,border:"2px solid #000",borderTopColor:"transparent",borderRadius:"50%",mx:"auto",mb:2,animation:"atSpin 0.7s linear infinite"}}/>
                        <ML>Loading…</ML>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );

    if(!product) return(
        <ThemeProvider theme={theme}>
            <Box sx={{minHeight:"100vh",backgroundColor:"#f5f5f0"}}><Navbar/>
                <Box sx={{textAlign:"center",pt:20}}><Typography sx={{fontFamily:serif,fontWeight:900,fontStyle:"italic",fontSize:28}}>Product not found</Typography></Box>
            </Box>
        </ThemeProvider>
    );

    const stockDot = variantStock===0?"#c0392b":variantStock<=5?"#d68910":"#1e8449";

    /* ══ RENDER ══ */
    return(
        <ThemeProvider theme={theme}>
        <Box sx={{minHeight:"100vh",backgroundColor:"#f5f5f0",fontFamily:mono}}>
            <Navbar/>

            {/* ── TICKER ── */}
            <Box sx={{backgroundColor:"#000",overflow:"hidden",height:26,display:"flex",alignItems:"center"}}>
                <Box sx={{display:"flex",animation:"atMarquee 22s linear infinite",whiteSpace:"nowrap",willChange:"transform"}}>
                    {Array.from({length:10}).map((_,i)=>(
                        <Box key={i} sx={{display:"inline-flex",alignItems:"center",gap:3,px:4}}>
                            <ML sx={{color:"rgba(255,255,255,0.35)",fontSize:8}}>{product.categoryName||"Collection"}</ML>
                            <Box sx={{width:2,height:2,backgroundColor:"rgba(255,255,255,0.2)",borderRadius:"50%"}}/>
                            <ML sx={{color:"rgba(255,255,255,0.2)",fontSize:8}}>Free shipping over Rs 5,000</ML>
                            <Box sx={{width:2,height:2,backgroundColor:"rgba(255,255,255,0.2)",borderRadius:"50%"}}/>
                            <ML sx={{color:"rgba(255,255,255,0.35)",fontSize:8}}>{product.productName}</ML>
                            <Box sx={{width:2,height:2,backgroundColor:"rgba(255,255,255,0.2)",borderRadius:"50%"}}/>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* ── BREADCRUMB NAV ── */}
            <Box sx={{px:{xs:2,md:5},py:2,display:"flex",justifyContent:"space-between",alignItems:"center",animation:"atFadeIn 0.35s ease both"}}>
                <Box onClick={()=>navigate(-1)} sx={{display:"inline-flex",alignItems:"center",gap:1,cursor:"pointer",color:"#bbb","&:hover":{color:"#000"},transition:"color 0.15s"}}>
                    <ArrowBack sx={{fontSize:12}}/>
                    <ML sx={{color:"inherit"}}>Back</ML>
                </Box>
                <Box sx={{display:"flex",gap:1,alignItems:"center"}}>
                    {product.categoryName&&<Box sx={{border:"1px solid #e0e0e0",backgroundColor:"#fff",px:1.2,py:0.3}}><ML sx={{color:"#aaa"}}>{product.categoryName}</ML></Box>}
                    {product.subCategoryName&&(<><ML sx={{color:"#ddd"}}>›</ML><Box sx={{border:"1px solid #e0e0e0",backgroundColor:"#fff",px:1.2,py:0.3}}><ML sx={{color:"#bbb"}}>{product.subCategoryName}</ML></Box></>)}
                </Box>
            </Box>

            {/* ══════════════════════════════════════════════════════
                MAIN PRODUCT SPLIT  —  image left, info right
            ══════════════════════════════════════════════════════ */}
            <Box sx={{
                display:"flex",flexDirection:{xs:"column",lg:"row"},
                mx:{xs:2,md:5},mb:8,
                backgroundColor:"#fff",
                border:"1px solid #e8e8e8",
                animation:"atFadeUp 0.5s 0.05s ease both",
            }}>

                {/* ══ LEFT — GALLERY (58%) ══ */}
                <Box sx={{
                    flex:{lg:"0 0 58%"},maxWidth:{lg:"58%"},
                    borderRight:{xs:"none",lg:"1px solid #e8e8e8"},
                    borderBottom:{xs:"1px solid #e8e8e8",lg:"none"},
                    display:"flex",flexDirection:"column",
                    backgroundColor:"#f9f9f9",
                }}>
                    {/* Main image */}
                    <Box sx={{position:"relative",flex:1,minHeight:{xs:340,sm:460,lg:580},overflow:"hidden",backgroundColor:"#ebebeb"}}>
                        {images.length>0?(
                            <Box key={activeImg} component="img" src={images[activeImg]} alt={product.productName}
                                sx={{width:"100%",height:"100%",objectFit:"cover",display:"block",animation:"atImgIn 0.4s cubic-bezier(0.25,0.46,0.45,0.94) both"}}/>
                        ):(
                            <Box sx={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <Typography sx={{fontFamily:serif,fontWeight:900,fontStyle:"italic",fontSize:{xs:140,md:200},color:"rgba(0,0,0,0.05)",userSelect:"none",lineHeight:1}}>
                                    {product.productName?.[0]||"?"}
                                </Typography>
                            </Box>
                        )}

                        {/* Discount tab */}
                        {hasDiscount&&(
                            <Box sx={{position:"absolute",top:0,left:0,backgroundColor:"#000",px:2,py:0.9}}>
                                <Typography sx={{fontFamily:mono,fontSize:11,fontWeight:700,color:"#fff",letterSpacing:"0.1em"}}>
                                    −{parseFloat(product.discount).toFixed(0)}%
                                </Typography>
                            </Box>
                        )}

                        {/* Image counter */}
                        {images.length>1&&(
                            <Box sx={{position:"absolute",bottom:0,left:0,backgroundColor:"rgba(0,0,0,0.6)",px:2.5,py:1,display:"flex",alignItems:"baseline",gap:1.5}}>
                                <Typography sx={{fontFamily:serif,fontStyle:"italic",fontWeight:900,fontSize:22,color:"#fff",lineHeight:1}}>
                                    {String(activeImg+1).padStart(2,"0")}
                                </Typography>
                                <ML sx={{color:"rgba(255,255,255,0.35)",fontSize:8}}>/ {String(images.length).padStart(2,"0")}</ML>
                            </Box>
                        )}

                        {/* Chevrons */}
                        {images.length>1&&[
                            {side:"left", icon:<ChevronLeft sx={{fontSize:20}}/>,  act:()=>setActiveImg(i=>(i-1+images.length)%images.length)},
                            {side:"right",icon:<ChevronRight sx={{fontSize:20}}/>, act:()=>setActiveImg(i=>(i+1)%images.length)},
                        ].map(({side,icon,act})=>(
                            <Box key={side} onClick={act} sx={{
                                position:"absolute",[side]:14,top:"50%",transform:"translateY(-50%)",
                                width:42,height:42,backgroundColor:"rgba(255,255,255,0.9)",
                                display:"flex",alignItems:"center",justifyContent:"center",
                                cursor:"pointer",border:"1px solid rgba(0,0,0,0.08)",
                                transition:"all 0.15s","&:hover":{backgroundColor:"#000",color:"#fff"},
                            }}>{icon}</Box>
                        ))}
                    </Box>

                    {/* Filmstrip */}
                    {images.length>1&&(
                        <Box sx={{p:{xs:1.5,md:2.5},borderTop:"1px solid #e8e8e8",backgroundColor:"#fff"}}>
                            <Box sx={{display:"flex",gap:1.5,overflowX:"auto",pb:0.5,"&::-webkit-scrollbar":{display:"none"}}}>
                                {images.map((src,i)=>(
                                    <Box key={i} className="at-thumb" onClick={()=>setActiveImg(i)} sx={{
                                        flexShrink:0,width:64,height:80,overflow:"hidden",cursor:"pointer",
                                        border:"1.5px solid",borderColor:activeImg===i?"#000":"transparent",
                                        opacity:activeImg===i?1:0.4,transition:"border-color 0.2s,opacity 0.2s",
                                        position:"relative","&:hover":{opacity:1,borderColor:"#000"},
                                    }}>
                                        <Box component="img" src={src} sx={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                                        {activeImg===i&&<Box sx={{position:"absolute",bottom:0,left:0,right:0,height:2,backgroundColor:"#000"}}/>}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* ══ RIGHT — PRODUCT INFO (42%) ══ */}
                <Box sx={{
                    flex:1,display:"flex",flexDirection:"column",
                    p:{xs:3,md:5,lg:6},
                    overflowY:{lg:"auto"},
                    position:{lg:"sticky"},top:{lg:0},
                    maxHeight:{lg:"100vh"},
                }}>
                    {/* SKU + stock pill */}
                    <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",mb:3}}>
                        <ML sx={{color:"#d0d0d0"}}>#{String(productId||0).padStart(5,"0")}</ML>
                        <Box sx={{display:"flex",alignItems:"center",gap:1,px:1.5,py:0.6,border:"1px solid #e8e8e8",backgroundColor:"#fafafa"}}>
                            <Box sx={{width:5,height:5,borderRadius:"50%",backgroundColor:stockDot,animation:"atBlink 2.5s infinite",flexShrink:0}}/>
                            <ML sx={{color:stockDot,fontSize:8}}>
                                {variantStock===0?"Out of stock":variantStock<=5?`${variantStock} left`:"In stock"}
                            </ML>
                        </Box>
                    </Box>

                    {/* ── NAME ── oversized editorial serif */}
                    <Typography sx={{
                        fontFamily:serif,fontWeight:900,
                        fontSize:{xs:28,sm:36,md:44,lg:48},
                        letterSpacing:"-0.03em",lineHeight:1.0,
                        color:"#000",mb:1,
                    }}>
                        {product.productName}
                    </Typography>
                    {/* Short accent line */}
                    <Box sx={{width:36,height:2.5,backgroundColor:"#000",mb:3.5}}/>

                    {/* ── PRICE ── */}
                    <Box sx={{mb:4,pb:4,borderBottom:"1px solid #f0f0eb"}}>
                        <ML sx={{mb:0.8}}>{hasDiscount?"Sale price":"Price"}</ML>
                        {hasDiscount?(
                            <Box sx={{display:"flex",alignItems:"flex-end",gap:3,flexWrap:"wrap"}}>
                                <Typography sx={{fontFamily:serif,fontWeight:900,fontStyle:"italic",fontSize:{xs:42,md:54},letterSpacing:"-0.04em",color:"#000",lineHeight:1}}>
                                    Rs {finalPrice.toLocaleString("en-LK",{minimumFractionDigits:2})}
                                </Typography>
                                <Box sx={{pb:0.5}}>
                                    <Typography sx={{fontFamily:mono,fontSize:12,color:"#ccc",textDecoration:"line-through"}}>
                                        Rs {origPrice.toLocaleString("en-LK",{minimumFractionDigits:2})}
                                    </Typography>
                                    <Box sx={{display:"inline-flex",backgroundColor:"#000",mt:0.5,px:1.2,py:0.3}}>
                                        <ML sx={{color:"#fff",fontSize:8}}>Save Rs {(origPrice-finalPrice).toLocaleString("en-LK",{minimumFractionDigits:2})}</ML>
                                    </Box>
                                </Box>
                            </Box>
                        ):(
                            <Typography sx={{fontFamily:serif,fontWeight:900,fontStyle:"italic",fontSize:{xs:42,md:54},letterSpacing:"-0.04em",color:"#000",lineHeight:1}}>
                                Rs {origPrice.toLocaleString("en-LK",{minimumFractionDigits:2})}
                            </Typography>
                        )}
                    </Box>

                    {/* ── DESCRIPTION ── */}
                    <Typography sx={{fontFamily:mono,fontSize:11,color:"#888",lineHeight:1.9,mb:4}}>
                        {product.productDescription||"No description available."}
                    </Typography>

                    {/* ── COLOUR ── */}
                    {hasVariants&&availColors.length>0&&(
                        <Box sx={{mb:4}}>
                            <HR label={`Colour${selectedColor?` — ${selectedColor}`:""}`} sx={{mb:2}}/>
                            <Box sx={{display:"flex",gap:2.5,flexWrap:"wrap",alignItems:"flex-end"}}>
                                {availColors.map(c=>{
                                    const sel=selectedColor===c;
                                    const stk=product.variants.some(v=>v.color===c&&v.quantity>0);
                                    return(
                                        <Box key={c} onClick={()=>handleColorSelect(c)} title={c} sx={{
                                            display:"flex",flexDirection:"column",alignItems:"center",gap:0.8,
                                            cursor:"pointer",opacity:stk?1:0.2,
                                        }}>
                                            <Box sx={{
                                                width:28,height:28,borderRadius:"50%",
                                                backgroundColor:COLOR_HEX[c]||"#ccc",
                                                border:"2px solid",
                                                borderColor:c==="WHITE"?(sel?"#000":"#ddd"):"transparent",
                                                outline:sel?"2.5px solid #000":"2.5px solid transparent",
                                                outlineOffset:"3px",
                                                transition:"all 0.15s","&:hover":{transform:"scale(1.18)"},
                                            }}/>
                                            <ML sx={{fontSize:7,color:sel?"#000":"#ccc"}}>{c}</ML>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    )}

                    {/* ── SIZE ── */}
                    {hasVariants&&availSizes.length>0&&(
                        <Box sx={{mb:4}}>
                            <HR label="Size" sx={{mb:2}}/>
                            <Box sx={{display:"flex",gap:1,flexWrap:"wrap"}}>
                                {availSizes.map(sz=>{
                                    const sel=selectedSize===sz;
                                    const v=product.variants.find(vv=>vv.color===selectedColor&&vv.size===sz);
                                    const avl=v&&v.quantity>0;
                                    return(
                                        <Box key={sz} onClick={()=>avl&&handleSizeSelect(sz)} sx={{
                                            px:2.5,py:1.1,cursor:avl?"pointer":"not-allowed",
                                            border:"1.5px solid",borderColor:sel?"#000":"#e0e0e0",
                                            backgroundColor:sel?"#000":"#fff",
                                            opacity:avl?1:0.28,transition:"all 0.15s",
                                            "&:hover":avl?{borderColor:"#000",backgroundColor:sel?"#000":"#f5f5f0"}:{},
                                        }}>
                                            <Typography sx={{fontFamily:mono,fontSize:11,fontWeight:600,letterSpacing:"0.06em",color:sel?"#fff":avl?"#000":"#ccc"}}>
                                                {sz}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    )}

                    {/* ── STATUS BAR ── */}
                    {!cantAdd&&(inCartQty>0||variantStock>0)&&(
                        <Box sx={{display:"flex",gap:3,mb:3,px:2,py:1.4,backgroundColor:"#f8f8f5",border:"1px solid #ebebeb",flexWrap:"wrap",alignItems:"center"}}>
                            <Box sx={{display:"flex",alignItems:"center",gap:1}}>
                                <Box sx={{width:5,height:5,borderRadius:"50%",backgroundColor:stockDot,flexShrink:0}}/>
                                <ML sx={{color:"#888"}}>{variantStock===0?"Out of stock":variantStock<=5?`${variantStock} left`:"Available"}</ML>
                            </Box>
                            {inCartQty>0&&<><Box sx={{width:1,height:12,backgroundColor:"#e0e0e0",flexShrink:0}}/><Box sx={{display:"flex",alignItems:"center",gap:1}}><ShoppingCart sx={{fontSize:10,color:"#000"}}/><ML sx={{color:"#000"}}>{inCartQty} in cart</ML></Box></>}
                            {availToAdd>0&&<><Box sx={{width:1,height:12,backgroundColor:"#e0e0e0",flexShrink:0}}/><ML sx={{color:"#bbb"}}>{availToAdd} more available</ML></>}
                        </Box>
                    )}

                    {/* Out of stock banner */}
                    {!cantAdd&&variantStock===0&&inCartQty===0&&(
                        <Box sx={{mb:3,py:2,px:3,border:"2px solid #000",display:"flex",alignItems:"center",gap:2}}>
                            <Box sx={{width:3,height:18,backgroundColor:"#000",flexShrink:0}}/>
                            <Box>
                                <Typography sx={{fontFamily:mono,fontWeight:700,fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"#000"}}>Out of Stock</Typography>
                                {hasVariants&&selectedColor&&selectedSize&&<ML sx={{mt:0.3}}>{selectedColor} · {selectedSize}</ML>}
                            </Box>
                        </Box>
                    )}

                    {/* ══ CART CONTROLS ══ */}
                    <Box sx={{mt:"auto",pt:2}}>
                        {cantAdd?(
                            <Box sx={{py:2.5,px:3,border:"1.5px dashed #d0d0d0",display:"flex",alignItems:"center",gap:2}}>
                                <Box sx={{width:3,height:16,backgroundColor:"#ccc",flexShrink:0}}/>
                                <ML sx={{color:"#bbb"}}>Select colour and size to continue</ML>
                            </Box>
                        ):inCartQty===0?(
                            <>
                                {variantStock>0&&(
                                    <Box sx={{display:"flex",alignItems:"center",gap:4,mb:3}}>
                                        <ML>Qty</ML>
                                        <Box sx={{display:"flex",alignItems:"stretch",border:"1.5px solid #000"}}>
                                            <Box onClick={()=>handleQtyChange(-1)} sx={{
                                                width:42,display:"flex",alignItems:"center",justifyContent:"center",
                                                cursor:quantity<=1?"default":"pointer",borderRight:"1px solid #e0e0e0",
                                                color:quantity<=1?"#ccc":"#000",
                                                transition:"background-color 0.15s",
                                                "&:hover":quantity>1?{backgroundColor:"#000","& svg":{color:"#fff"}}:{},
                                            }}><Remove sx={{fontSize:14}}/></Box>
                                            <Typography sx={{fontFamily:serif,fontWeight:700,fontStyle:"italic",fontSize:20,px:4,minWidth:54,textAlign:"center",lineHeight:"46px"}}>
                                                {quantity}
                                            </Typography>
                                            <Box onClick={()=>handleQtyChange(1)} sx={{
                                                width:42,display:"flex",alignItems:"center",justifyContent:"center",
                                                cursor:quantity>=variantStock?"default":"pointer",borderLeft:"1px solid #e0e0e0",
                                                color:quantity>=variantStock?"#ccc":"#000",
                                                transition:"background-color 0.15s",
                                                "&:hover":quantity<variantStock?{backgroundColor:"#000","& svg":{color:"#fff"}}:{},
                                            }}><Add sx={{fontSize:14}}/></Box>
                                        </Box>
                                        <ML sx={{color:"#ccc"}}>{variantStock} in stock</ML>
                                    </Box>
                                )}

                                {/* PRIMARY BUTTON — slide-fill animation */}
                                <Box className="at-btn-solid" onClick={!addingToCart?handleAddToCart:undefined} sx={{
                                    width:"100%",py:2.2,
                                    display:"flex",alignItems:"center",justifyContent:"center",gap:2,
                                    backgroundColor:variantStock===0?"#e0e0e0":addingToCart?"#333":"#000",
                                    cursor:variantStock===0?"not-allowed":addingToCart?"wait":"pointer",
                                    pointerEvents:variantStock===0?"none":"auto",
                                    transition:"background-color 0.2s",
                                }}>
                                    {addingToCart
                                        ?<Box sx={{width:14,height:14,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",animation:"atSpin 0.7s linear infinite"}}/>
                                        :<ShoppingCart className="at-ico" sx={{fontSize:15,color:variantStock===0?"#aaa":"#fff"}}/>
                                    }
                                    <Typography className="at-lbl" sx={{fontFamily:mono,fontWeight:700,fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:variantStock===0?"#aaa":"#fff"}}>
                                        {addingToCart?"Adding…":variantStock===0?"Out of Stock":"Add to Cart"}
                                    </Typography>
                                </Box>
                            </>
                        ):(
                            <>
                                {hasVariants&&selectedColor&&selectedSize&&(
                                    <Box sx={{display:"flex",alignItems:"center",gap:1.5,mb:2.5}}>
                                        <ShoppingCart sx={{fontSize:11,color:"#aaa"}}/>
                                        <ML sx={{color:"#888"}}>In cart</ML>
                                        <Box sx={{display:"flex",alignItems:"center",gap:0.5,border:"1px solid #e0e0e0",px:1,py:0.3}}>
                                            <Box sx={{width:7,height:7,borderRadius:"50%",backgroundColor:COLOR_HEX[selectedColor]||"#ccc",border:"1px solid rgba(0,0,0,0.1)",flexShrink:0}}/>
                                            <ML sx={{color:"#666",fontSize:8}}>{selectedColor}</ML>
                                        </Box>
                                        <Box sx={{border:"1px solid #e0e0e0",px:1,py:0.3}}><ML sx={{color:"#666",fontSize:8}}>{selectedSize}</ML></Box>
                                    </Box>
                                )}

                                <Box sx={{display:"flex",alignItems:"center",gap:3,mb:3}}>
                                    <Box sx={{display:"flex",alignItems:"stretch",border:"2px solid #000"}}>
                                        <Box onClick={()=>handleUpdateQty(-1)} sx={{width:50,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",borderRight:"2px solid #000","&:hover":{backgroundColor:"#000","& svg":{color:"#fff"}},transition:"background-color 0.15s"}}>
                                            <Remove sx={{fontSize:16}}/>
                                        </Box>
                                        <Typography sx={{fontFamily:serif,fontWeight:900,fontStyle:"italic",fontSize:26,px:4,minWidth:68,textAlign:"center",lineHeight:"56px"}}>
                                            {inCartQty}
                                        </Typography>
                                        <Box onClick={()=>handleUpdateQty(1)} sx={{width:50,display:"flex",alignItems:"center",justifyContent:"center",cursor:inCartQty>=variantStock?"not-allowed":"pointer",borderLeft:"2px solid #000",color:inCartQty>=variantStock?"#ccc":"#000","&:hover":inCartQty<variantStock?{backgroundColor:"#000","& svg":{color:"#fff"}}:{},transition:"background-color 0.15s"}}>
                                            <Add sx={{fontSize:16}}/>
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Box sx={{display:"flex",alignItems:"center",gap:1}}>
                                            <Box sx={{width:5,height:5,borderRadius:"50%",backgroundColor:inCartQty>=variantStock?"#d68910":"#1e8449",flexShrink:0}}/>
                                            <ML sx={{color:"#555"}}>{inCartQty>=variantStock?"Max reached":`${variantStock-inCartQty} more`}</ML>
                                        </Box>
                                        <ML sx={{color:"#ccc",mt:0.4}}>− remove · + add</ML>
                                    </Box>
                                </Box>

                                {inCartQty<variantStock&&(
                                    <Box className="at-btn-outline" onClick={!addingToCart?handleAddToCart:undefined} sx={{
                                        width:"100%",py:1.9,
                                        display:"flex",alignItems:"center",justifyContent:"center",gap:2,
                                        border:"2px solid #000",cursor:addingToCart?"wait":"pointer",
                                    }}>
                                        <ShoppingCart className="at-ico" sx={{fontSize:14,color:"#000"}}/>
                                        <Typography className="at-lbl" sx={{fontFamily:mono,fontWeight:700,fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:"#000"}}>
                                            {addingToCart?"Adding…":"Add More"}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* ══ RELATED PRODUCTS ══ */}
            {relatedProducts.length>0&&(
                <Box sx={{borderTop:"2px solid #000",backgroundColor:"#f5f5f0",animation:"atFadeUp 0.5s 0.3s ease both"}}>
                    <Box sx={{px:{xs:2,md:5},pt:7}}>
                        <Box sx={{display:"flex",alignItems:"center",gap:3,mb:6}}>
                            <Box sx={{width:3,height:26,backgroundColor:"#000",flexShrink:0}}/>
                            <Typography sx={{fontFamily:serif,fontWeight:700,fontStyle:"italic",fontSize:{xs:22,md:28},color:"#000",lineHeight:1}}>
                                More from {product.categoryName||"this collection"}
                            </Typography>
                            <Box sx={{flex:1,height:1,backgroundColor:"#e0e0e0"}}/>
                        </Box>
                    </Box>
                    <ProductSection
                        products={relatedProducts}
                        getImageUrl={resolveUrl}
                        getCartQuantity={()=>0}
                        handleProductClick={(pid)=>{ navigate(`/product/${pid}`); window.scrollTo({top:0,behavior:"smooth"}); }}
                    />
                </Box>
            )}

            {/* ── FOOTER ── */}
            <Box sx={{borderTop:"1px solid #e0e0e0",backgroundColor:"#fff",py:2.5,px:{xs:3,md:5},display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:1}}>
                <ML sx={{color:"#ccc"}}>© {new Date().getFullYear()} CLOTHIFY — All Rights Reserved</ML>
                <Box onClick={()=>navigate(-1)} sx={{display:"flex",alignItems:"center",gap:0.8,cursor:"pointer","&:hover":{opacity:0.6},transition:"opacity 0.15s"}}>
                    <ArrowBack sx={{fontSize:11,color:"#bbb"}}/><ML>Back</ML>
                </Box>
            </Box>

            {/* ── SNACKBAR ── */}
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={()=>setSnackbar(s=>({...s,open:false}))} anchorOrigin={{vertical:"bottom",horizontal:"right"}}>
                <Alert onClose={()=>setSnackbar(s=>({...s,open:false}))} severity={snackbar.severity}
                    sx={{borderRadius:0,fontFamily:mono,fontSize:12,border:"1px solid #000",backgroundColor:"#fff",color:"#000","& .MuiAlert-icon":{color:"#000"}}}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
        </ThemeProvider>
    );
};

export default ProductDetails;