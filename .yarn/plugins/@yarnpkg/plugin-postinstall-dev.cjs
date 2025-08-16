/* eslint-disable */
//prettier-ignore
module.exports = {
name: "@yarnpkg/plugin-postinstall-dev",
factory: function (require) {
var plugin=(()=>{var i=Object.create,s=Object.defineProperty;var n=Object.getOwnPropertyDescriptor;var d=Object.getOwnPropertyNames;var l=Object.getPrototypeOf,p=Object.prototype.hasOwnProperty;var u=t=>s(t,"__esModule",{value:!0});var f=t=>{if(typeof require!="undefined")return require(t);throw new Error('Dynamic require of "'+t+'" is not supported')};var g=(t,e)=>{for(var o in e)s(t,o,{get:e[o],enumerable:!0})},k=(t,e,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of d(e))!p.call(t,r)&&r!=="default"&&s(t,r,{get:()=>e[r],enumerable:!(o=n(e,r))||o.enumerable});return t},P=t=>k(u(s(t!=null?i(l(t)):{},"default",t&&t.__esModule&&"default"in t?{get:()=>t.default,enumerable:!0}:{value:t,enumerable:!0})),t);var x={};g(x,{default:()=>w});var c=P(f("@yarnpkg/core")),a="postinstallDev",h={hooks:{async afterAllInstalled(t){let e=t.topLevelWorkspace.anchoredLocator;if(await c.scriptUtils.hasPackageScript(e,a,{project:t})){let o=await c.scriptUtils.executePackageScript(e,a,[],{project:t,stdin:process.stdin,stdout:process.stdout,stderr:process.stderr});if(o!==0){let r=new Error(`${a} script failed with exit code ${o}`);throw r.stack=void 0,r}}}}},w=h;return x;})();
return plugin;
}
};
