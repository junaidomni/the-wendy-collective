import type { CSSProperties } from "react";
import "../pages/OfferCollection.css";
// Display whole panels from the untouched original. Only white separators are excluded.
const panels={pride:{x:0,w:505},mardi:{x:518,w:500},alaska:{x:1030,w:506}};
export default function ApprovedOfferArt({art,title}:{art:"valentines"|"pride"|"mardi"|"alaska";title:string}){
 if(art==="valentines")return <img className="approved-valentine" src="/images/offers/approved-valentines.png" width="1024" height="1536" alt={`Approved promotional artwork for ${title}. Artwork text is not verified sailing information.`}/>;
 const panel=panels[art];
 const labels = art === "pride" ? ["RelaxAway, Half Moon Cay", "Nassau", "Celebration Key"] : art === "alaska" ? ["Ketchikan", "Sitka", "Victoria, BC", "Glacier cruising"] : ["Nassau", "RelaxAway, Half Moon Cay", "Amber Cove", "Celebration Key"];

 return <div className={`approved-panel approved-panel--${art}`} style={{aspectRatio:`${panel.w}/1024`} as CSSProperties}><img src="/images/offers/approved-three-panel.png" width="1536" height="1024" style={{width:`${1536/panel.w*100}%`,left:`${-panel.x/panel.w*100}%`}} alt={`Promotional artwork for ${title}. Destination photographs are illustrative; see the itinerary below for confirmed ports.`}/><div className="twco-art-port-labels" aria-label="Confirmed itinerary highlights">{labels.map(label=><span key={label}>{label}</span>)}</div></div>;
}
