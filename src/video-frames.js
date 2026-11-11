export function videoFramePlan(fps,seconds){if(![15,24,30].includes(fps)||!Number.isFinite(seconds)||seconds<3||seconds>12)throw Error('Cadencia o duración inválida');const count=Math.max(2,Math.round(fps*seconds));return Array.from({length:count},(_,index)=>({fraction:index/(count-1),timestamp:Math.round(index*1e6/fps),duration:Math.round(1e6/fps)}))}
// Deterministic local WebM frames. The caller retains the existing MediaRecorder fallback.
export async function encodeVideoFrames({canvas,fps,seconds,render,progress,signal}){
 if(signal?.aborted)throw new DOMException('Video cancelado','AbortError');
 if(typeof VideoEncoder==='undefined'||typeof VideoFrame==='undefined')return null;
 const config={codec:'vp09.00.10.08',width:canvas.width,height:canvas.height,bitrate:3000000,framerate:fps};
 let supported;try{supported=await VideoEncoder.isConfigSupported(config)}catch{return null}if(!supported.supported)return null;
 const {Muxer,ArrayBufferTarget}=await import('../vendor/webm-muxer.js?v=fep-f2922fbf7e7adae7'),target=new ArrayBufferTarget(),muxer=new Muxer({target,video:{codec:'V_VP9',width:canvas.width,height:canvas.height,frameRate:fps},firstTimestampBehavior:'offset'});
 let failure;const encoder=new VideoEncoder({output:(chunk,metadata)=>muxer.addVideoChunk(chunk,metadata),error:error=>{failure=error}}),plan=videoFramePlan(fps,seconds),count=plan.length;
 try{encoder.configure(supported.config);for(let index=0;index<count;index++){
  if(signal?.aborted)throw new DOMException('Video cancelado','AbortError');if(failure)throw failure;render(plan[index].fraction);const frame=new VideoFrame(canvas,{timestamp:plan[index].timestamp,duration:plan[index].duration});try{encoder.encode(frame,{keyFrame:index%Math.max(1,fps*2)===0})}finally{frame.close()}
  if(encoder.encodeQueueSize>2)await encoder.flush();if(index%6===0)progress?.(Math.round((index+1)/count*100));await new Promise(requestAnimationFrame);
 }if(signal?.aborted)throw new DOMException('Video cancelado','AbortError');await encoder.flush();if(failure)throw failure;muxer.finalize();return new Blob([target.buffer],{type:'video/webm'})}finally{if(encoder.state!=='closed')encoder.close()}
}
