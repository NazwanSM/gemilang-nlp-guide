/* Apply the preference before paint. Theme works even when storage is blocked. */
(()=>{
 let media=matchMedia('(prefers-color-scheme: dark)');
 let mode='system';
 try{const saved=localStorage.getItem('gemilang-theme');if(['system','light','dark'].includes(saved))mode=saved;}catch{}
 const apply=()=>{document.documentElement.dataset.theme=mode==='system'?(media.matches?'dark':'light'):mode;};
 const watch=()=>{media.removeEventListener('change',apply);media=matchMedia('(prefers-color-scheme: dark)');media.addEventListener('change',apply);};
 window.GuideTheme={get mode(){return mode;},set(value){if(!['system','light','dark'].includes(value))return;mode=value;watch();try{localStorage.setItem('gemilang-theme',mode);}catch{}apply();}};
 media.addEventListener('change',apply);
 addEventListener('storage',e=>{if(e.key==='gemilang-theme'){mode=['light','dark'].includes(e.newValue)?e.newValue:'system';apply();const select=document.getElementById('theme-mode');if(select)select.value=mode;}});
 apply();
})();
