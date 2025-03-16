(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[974],{1057:(e,t,l)=>{"use strict";l.r(t),l.d(t,{default:()=>n});var i=l(5155),r=l(2115),s=l(3925);function n(){let[e,t]=(0,r.useState)(null),[n,a]=(0,r.useState)(!1),[o,c]=(0,r.useState)(null),[d,h]=(0,r.useState)(!1);(0,r.useEffect)(()=>{(async()=>{try{window.require||(window.require={}),window.require.ensure||(window.require.ensure=(e,t)=>t());let e=await Promise.all([l.e(120),l.e(297)]).then(l.t.bind(l,7732,23));e.GlobalWorkerOptions.workerSrc="/pdf.worker.min.js",c(e),h(!0)}catch(e){console.error("extracthighlights 모듈 로딩 오류:",e)}})()},[]);let m=async()=>{if(e&&o){a(!0);try{let t=await e.arrayBuffer(),l=await u(t);if(0===l.length){alert("하이라이트된 텍스트를 찾을 수 없습니다."),a(!1);return}let i=x(l),r=s.Wp.book_new(),n=Math.max(...i.map(e=>e.pageNumbers.length)),o=i.map(e=>{let t={"하이라이트 텍스트":e.text};return e.pageNumbers.forEach((e,l)=>{t["페이지 ".concat(l+1)]=e}),t}),c=s.Wp.json_to_sheet(o),d=[{wch:70}];for(let e=0;e<n;e++)d.push({wch:10});c["!cols"]=d,s.Wp.book_append_sheet(r,c,"하이라이트"),s._h(r,"highlights.xlsx"),alert("하이라이트가 Excel 파일로 저장되었습니다.")}catch(e){console.error("PDF 처리 오류:",e),alert("PDF 처리 중 오류가 발생했습니다.")}a(!1)}},u=async e=>{try{if(!o)throw Error("PDF 처리 모듈이 로드되지 않았습니다.");let t=o.getDocument(e),l=await t.promise,i=[],r=["Text","Highlight","Underline"],s={};for(let e=1;e<=l.numPages;e++){let t=await l.getPage(e),i=t.getViewport({scale:1}),n=document.createElement("canvas"),a=n.getContext("2d");if(!a)continue;n.height=i.height,n.width=i.width;let o={canvasContext:a,viewport:i},c=await t.getAnnotations();c=c.filter(e=>r.includes(e.subtype||e.type||"")).map(t=>(t.subtype||(t.subtype=t.type),t.pageNumber=e,t)),await t.render(o,c);let d=c.filter(e=>e.highlightedText&&""!==e.highlightedText.trim());d.length>0&&(s[e]=d)}return Object.keys(s).forEach(e=>{let t=s[e];t.sort((e,t)=>{var l,i,r,s,n,a;let o=null===(r=e.quadPoints)||void 0===r?void 0:null===(i=r[0])||void 0===i?void 0:null===(l=i.dims)||void 0===l?void 0:l.minY,c=null===(a=t.quadPoints)||void 0===a?void 0:null===(n=a[0])||void 0===n?void 0:null===(s=n.dims)||void 0===s?void 0:s.minY;if(void 0!==o&&void 0!==c){if(o<c)return -1;if(o>c)return 1}return 0}),t.forEach(t=>{let l="";t.contents&&""!==t.contents.trim()?l=t.contents.trim():t.highlightedText&&""!==t.highlightedText.trim()&&(l=t.highlightedText.trim());let r=l.replace(/\r?\n|\r/g," ").replace(/\s+/g," ").trim();r&&i.push({text:r,page:parseInt(e)})})}),i}catch(e){return console.error("PDF 하이라이트 처리 오류:",e),[]}},x=e=>{let t={};return e.forEach(e=>{let{text:l,page:i}=e;l.trim()&&(t[l]?t[l].includes(i)||t[l].push(i):t[l]=[i])}),Object.keys(t).forEach(e=>{t[e].sort((e,t)=>e-t)}),Object.keys(t).map(e=>({text:e,pageNumbers:t[e]})).sort((e,t)=>e.pageNumbers[0]-t.pageNumbers[0])};return(0,i.jsx)("main",{className:"flex min-h-screen flex-col items-center justify-center p-6 sm:p-12",children:(0,i.jsxs)("div",{className:"z-10 max-w-2xl w-full items-center justify-center",children:[(0,i.jsx)("h1",{className:"text-4xl font-bold mb-8 text-center",children:"PDF 하이라이트 추출기"}),(0,i.jsxs)("div",{className:"bg-white rounded-lg shadow-md p-6",children:[(0,i.jsxs)("div",{className:"mb-5",children:[(0,i.jsx)("h2",{className:"text-xl font-semibold mb-2",children:"사용 방법"}),(0,i.jsxs)("ol",{className:"list-decimal pl-5 space-y-1 text-gray-700",children:[(0,i.jsx)("li",{children:"PDF 파일을 선택합니다."}),(0,i.jsx)("li",{children:"하이라이트 추출하기 버튼을 클릭합니다."}),(0,i.jsx)("li",{children:"추출된 하이라이트가 Excel 파일로 저장됩니다."})]}),(0,i.jsxs)("div",{className:"mt-3 text-sm text-gray-600 bg-gray-100 p-3 rounded",children:[(0,i.jsx)("p",{className:"font-medium mb-1",children:"✨ Excel 결과 형식:"}),(0,i.jsxs)("ul",{className:"list-disc pl-5",children:[(0,i.jsx)("li",{children:"A열: 하이라이트된 텍스트"}),(0,i.jsx)("li",{children:"B열부터: 각 텍스트가 등장하는 페이지 번호가 순서대로 정렬"}),(0,i.jsx)("li",{children:"결과는 첫 페이지 번호 순으로 정렬됩니다."}),(0,i.jsx)("li",{children:"여러 줄에 걸친 하이라이트는 자동으로 한 줄로 합쳐집니다."}),(0,i.jsx)("li",{children:"PDF에 메모가 있는 경우, 하이라이트된 텍스트보다 메모 내용을 우선적으로 추출합니다."})]})]})]}),(0,i.jsx)("input",{type:"file",accept:".pdf",onChange:e=>{e.target.files&&e.target.files[0]&&t(e.target.files[0])},className:"block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"}),(0,i.jsx)("button",{onClick:m,disabled:!e||n||!d,className:"mt-4 w-full py-3 px-4 rounded-md text-white font-semibold\n              ".concat(e&&!n&&d?"bg-violet-600 hover:bg-violet-700":"bg-gray-400 cursor-not-allowed"),children:d?n?"처리 중...":"하이라이트 추출하기":"준비 중..."}),e&&(0,i.jsxs)("p",{className:"mt-3 text-sm text-gray-600",children:["선택된 파일: ",e.name]})]})]})})}},1162:(e,t,l)=>{Promise.resolve().then(l.bind(l,1057))},2383:()=>{},3686:()=>{}},e=>{var t=t=>e(e.s=t);e.O(0,[524,441,684,358],()=>t(1162)),_N_E=e.O()}]);