You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
feature-sections.tsx
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Example() {
  return (
    <section className="w-full py-16">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>


      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-semibold">Powerful Features</h1>
        <p className="text-sm text-slate-500 mt-2">
          Everything you need to manage, track, and grow your finances, securely and efficiently.
        </p>
      </div>

      {/* Блок карточек */}
      <div className="flex flex-wrap items-start justify-center gap-10">
        <div className="max-w-80 hover:-translate-y-0.5 transition duration-300">
          <img
            className="rounded-xl"
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-1.png"
            alt=""
          />
          <h3 className="text-base font-semibold text-slate-700 mt-4">Feedback analyser</h3>
          <p className="text-sm text-slate-600 mt-1">
            Get instant insights into your finances with live dashboards.
          </p>
        </div>

        <div className="max-w-80 hover:-translate-y-0.5 transition duration-300">
          <img
            className="rounded-xl"
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-2.png"
            alt=""
          />
          <h3 className="text-base font-semibold text-slate-700 mt-4">User management</h3>
          <p className="text-sm text-slate-600 mt-1">
            Get instant insights into your finances with live dashboards.
          </p>
        </div>

        <div className="max-w-80 hover:-translate-y-0.5 transition duration-300">
          <img
            className="rounded-xl"
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-3.png"
            alt=""
          />
          <h3 className="text-base font-semibold text-slate-700 mt-4">Better invoicing</h3>
          <p className="text-sm text-slate-600 mt-1">
            Get instant insights into your finances with live dashboards.
          </p>
        </div>
      </div>
    </section>
  );
}


demo.tsx
export default function Example() {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
            
            <div className="flex flex-col md:flex-row items-center justify-center">
                <img className="max-w-2xl w-full" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/card-image-1.png" alt="" />
                <div className="space-y-6 px-4 md:px-0">
                    <div className="flex items-center justify-center rounded-xl py-4 pr-4 gap-6 max-w-md bg-violet-100 border border-violet-200">
                        <div className="p-6 aspect-square">
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 18.667V24.5m4.668-8.167V24.5m4.664-12.833V24.5m2.333-21L15.578 13.587a.584.584 0 0 1-.826 0l-3.84-3.84a.583.583 0 0 0-.825 0L2.332 17.5M4.668 21v3.5m4.664-8.167V24.5" stroke="#7F22FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-base font-semibold text-slate-700">Real-Time Analytics</h3>
                            <p className="text-sm text-slate-600">Get instant insights into your finances with live dashboards.</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center rounded-xl py-4 pr-4 gap-6 max-w-md">
                        <div className="p-6 aspect-square">
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 11.667A2.333 2.333 0 0 0 11.667 14c0 1.19-.117 2.929-.304 4.667m4.972-3.36c0 2.776 0 7.443-1.167 10.36m5.004-1.144c.14-.7.502-2.683.583-3.523M2.332 14a11.667 11.667 0 0 1 21-7m-21 11.667h.01m23.092 0c.233-2.333.152-6.246 0-7" stroke="#00A63E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M5.832 22.75C6.415 21 6.999 17.5 6.999 14a7 7 0 0 1 .396-2.333m2.695 13.999c.245-.77.525-1.54.665-2.333m-.255-15.4A7 7 0 0 1 21 14v2.333" stroke="#00A63E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-base font-semibold text-slate-700">Bank-Grade Security</h3>
                            <p className="text-sm text-slate-600">End-to-end encryption, 2FA, compliance with GDPR standards.</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center rounded-xl py-4 pr-4 gap-6 max-w-md">
                        <div className="p-6 aspect-square">
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.668 25.666h16.333a2.333 2.333 0 0 0 2.334-2.333V8.166L17.5 2.333H7a2.333 2.333 0 0 0-2.333 2.333v4.667" stroke="#F54900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16.332 2.333V7a2.334 2.334 0 0 0 2.333 2.333h4.667m-21 8.167h11.667M10.5 21l3.5-3.5-3.5-3.5" stroke="#F54900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-base font-semibold text-slate-700">Customizable Reports</h3>
                            <p className="text-sm text-slate-600">Export professional, audit-ready financial reports for tax or internal review.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
```


import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Example() {
  return (
    <section className="w-full py-16">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>


      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-semibold">Powerful Features</h1>
        <p className="text-sm text-slate-500 mt-2">
          Everything you need to manage, track, and grow your finances, securely and efficiently.
        </p>
      </div>

      {/* Блок карточек */}
      <div className="flex flex-wrap items-start justify-center gap-10">
        <div className="max-w-80 hover:-translate-y-0.5 transition duration-300">
          <img
            className="rounded-xl"
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-1.png"
            alt=""
          />
          <h3 className="text-base font-semibold text-slate-700 mt-4">Feedback analyser</h3>
          <p className="text-sm text-slate-600 mt-1">
            Get instant insights into your finances with live dashboards.
          </p>
        </div>

        <div className="max-w-80 hover:-translate-y-0.5 transition duration-300">
          <img
            className="rounded-xl"
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-2.png"
            alt=""
          />
          <h3 className="text-base font-semibold text-slate-700 mt-4">User management</h3>
          <p className="text-sm text-slate-600 mt-1">
            Get instant insights into your finances with live dashboards.
          </p>
        </div>

        <div className="max-w-80 hover:-translate-y-0.5 transition duration-300">
          <img
            className="rounded-xl"
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-3.png"
            alt=""
          />
          <h3 className="text-base font-semibold text-slate-700 mt-4">Better invoicing</h3>
          <p className="text-sm text-slate-600 mt-1">
            Get instant insights into your finances with live dashboards.
          </p>
        </div>
      </div>
    </section>
  );
}
