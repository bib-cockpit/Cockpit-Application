"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[5283],{5283:(y,h,p)=>{p.r(h),p.d(h,{startTapClick:()=>b});var i=p(37693),u=p(32674);const b=s=>{if(void 0===i.d)return;let e,E,c,o=10*-v,r=0;const O=s.getBoolean("animated",!0)&&s.getBoolean("rippleEffect",!0),l=new WeakMap,L=t=>{o=(0,u.u)(t),R(t)},A=()=>{c&&clearTimeout(c),c=void 0,e&&(I(!1),e=void 0)},D=t=>{e||w(g(t),t)},R=t=>{w(void 0,t)},w=(t,n)=>{if(t&&t===e)return;c&&clearTimeout(c),c=void 0;const{x:d,y:a}=(0,u.v)(n);if(e){if(l.has(e))throw new Error("internal error");e.classList.contains(f)||C(e,d,a),I(!0)}if(t){const M=l.get(t);M&&(clearTimeout(M),l.delete(t)),t.classList.remove(f);const S=()=>{C(t,d,a),c=void 0};T(t)?S():c=setTimeout(S,k)}e=t},C=(t,n,d)=>{if(r=Date.now(),t.classList.add(f),!O)return;const a=P(t);null!==a&&(_(),E=a.addRipple(n,d))},_=()=>{void 0!==E&&(E.then(t=>t()),E=void 0)},I=t=>{_();const n=e;if(!n)return;const d=m-Date.now()+r;if(t&&d>0&&!T(n)){const a=setTimeout(()=>{n.classList.remove(f),l.delete(n)},m);l.set(n,a)}else n.classList.remove(f)};i.d.addEventListener("ionGestureCaptured",A),i.d.addEventListener("touchstart",t=>{o=(0,u.u)(t),D(t)},!0),i.d.addEventListener("touchcancel",L,!0),i.d.addEventListener("touchend",L,!0),i.d.addEventListener("pointercancel",A,!0),i.d.addEventListener("mousedown",t=>{if(2===t.button)return;const n=(0,u.u)(t)-v;o<n&&D(t)},!0),i.d.addEventListener("mouseup",t=>{const n=(0,u.u)(t)-v;o<n&&R(t)},!0)},g=s=>{if(void 0===s.composedPath)return s.target.closest(".ion-activatable");{const o=s.composedPath();for(let r=0;r<o.length-2;r++){const e=o[r];if(!(e instanceof ShadowRoot)&&e.classList.contains("ion-activatable"))return e}}},T=s=>s.classList.contains("ion-activatable-instant"),P=s=>{if(s.shadowRoot){const o=s.shadowRoot.querySelector("ion-ripple-effect");if(o)return o}return s.querySelector("ion-ripple-effect")},f="ion-activated",k=100,m=150,v=2500}}]);