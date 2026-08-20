import React, {useEffect,useState} from 'react';
export default function PromoSlider({promos=[]}){
 const slides=[1,2,3,4].map((n,i)=>promos[i]||{title:`PROMO ${n}`,image:''});
 const [i,setI]=useState(0);
 useEffect(()=>{const t=setInterval(()=>setI(x=>(x+1)%4),4500);return()=>clearInterval(t)},[]);
 return <div className="promo-wrap"><div className="promo-track" style={{transform:`translateX(-${i*100}%)`}}>{slides.map((p,k)=><div className="promo-slide" key={k}>{p.image?<img src={p.image} alt={p.title||`Promo ${k+1}`}/>:<div className="promo-empty"><span>🌿</span><b>{p.title||`PROMO ${k+1}`}</b><small>Upload promo dari Admin</small></div>}</div>)}</div><div className="dots">{slides.map((_,k)=><button key={k} className={k===i?'active':''} onClick={()=>setI(k)} aria-label={`Slide ${k+1}`}/>)}</div></div>
}
