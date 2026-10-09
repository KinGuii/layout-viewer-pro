import { useRef, useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProfileArt } from '@/components/profile-art';
export function ProfileStory({open,onOpenChange,name,avatar,streak,symbol,xp,tags}: {open:boolean;onOpenChange:(open:boolean)=>void;name:string;avatar:number;streak:number;symbol:string;xp:number;tags:string[]}) {
 const art=useRef<HTMLDivElement>(null);const [message,setMessage]=useState('');
 async function exportImage(copy:boolean) {
  try {
   const svg=art.current?.querySelector('svg');if(!svg)return;
   const clone=svg.cloneNode(true) as SVGElement;
   const originals=[svg,...Array.from(svg.querySelectorAll('*'))];const copies=[clone,...Array.from(clone.querySelectorAll('*'))];
   originals.forEach((node,i)=>{const target=copies[i];if(!target)return;const style=getComputedStyle(node);for(const prop of ['fill','stroke','stop-color','opacity'])target.setAttribute(prop,style.getPropertyValue(prop));});
   clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
   const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'}));const img=new Image();img.src=url;await img.decode();
   const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext('2d');if(!ctx)return;
   const root=art.current;if(!root)return;const theme=getComputedStyle(root);ctx.fillStyle=theme.getPropertyValue('--background').trim();ctx.fillRect(0,0,1080,1920);ctx.fillStyle=theme.getPropertyValue('--foreground').trim();ctx.textAlign='center';ctx.font='500 34px sans-serif';ctx.fillText('MUSIC DESK PRO',540,150);ctx.save();ctx.beginPath();ctx.arc(540,600,235,0,Math.PI*2);ctx.clip();ctx.drawImage(img,305,365,470,470);ctx.restore();URL.revokeObjectURL(url);
   ctx.font='600 64px sans-serif';const safeName=name.length>24?`${name.slice(0,23)}…`:name;ctx.fillText(safeName,540,970,920);ctx.font='52px sans-serif';ctx.fillText(`${symbol} ${streak} dias de frequência`,540,1100);ctx.font='500 42px sans-serif';ctx.fillText(`${xp} XP · Sua escuta deixa marcas`,540,1200);ctx.font='36px sans-serif';tags.forEach((tag,i)=>ctx.fillText(tag,540,1370+i*70,920));ctx.font='28px sans-serif';ctx.fillText('NA SUA FREQUÊNCIA.',540,1790);
   const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)return;
   if(copy&&navigator.clipboard&&typeof ClipboardItem!=='undefined'){try{await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);setMessage('Imagem copiada.');return;}catch{setMessage('Cópia indisponível. Imagem baixada.');}}
   const download=URL.createObjectURL(blob);const a=document.createElement('a');a.href=download;a.download='music-desk-story.png';a.click();URL.revokeObjectURL(download);setMessage('Cartão baixado.');
  }catch{setMessage('Não foi possível exportar. Tente novamente.');}
 }
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="profile-theme profile-modal story-modal"><DialogTitle>Seu cartão musical</DialogTitle><DialogDescription>Music Desk Pro · Stories</DialogDescription><div className="story-card" ref={art}><span className="story-brand">MUSIC DESK <b>PRO</b></span><ProfileArt index={avatar}/><h2>{name}</h2><strong>{symbol} {streak} dias de frequência</strong><p>{xp} XP</p><div className="story-tags">{tags.map(t=><span key={t}>{t}</span>)}</div><small>NA SUA FREQUÊNCIA.</small></div><div className="story-actions"><Button onClick={()=>exportImage(true)}><Copy size={15}/>Copiar Imagem</Button><Button variant="outline" aria-label="Baixar imagem" title="Baixar imagem" onClick={()=>exportImage(false)}><Download size={16}/></Button><Button variant="ghost" onClick={()=>onOpenChange(false)}>Fechar</Button></div>{message&&<p role="status">{message}</p>}</DialogContent></Dialog>;
}