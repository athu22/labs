
import React, { forwardRef } from 'react';

const MembershipFormPDF = forwardRef(({ data }, ref) => {
   if (!data) return null;

   // Calculate valid up to date (5 years from approval)
   let validUpTo = '31 March 2031';
   if (data.approvedAt) {
      try {
         const approvedDate = new Date(data.approvedAt);
         if (!isNaN(approvedDate)) {
            approvedDate.setFullYear(approvedDate.getFullYear() + 5);
            validUpTo = approvedDate.toLocaleDateString('en-GB', {
               day: '2-digit',
               month: 'long',
               year: 'numeric'
            });
         }
      } catch (e) {
         validUpTo = '31 March 2031';
      }
   }

   // Certificate data from form data
   const certificateData = {
      name: data.fullName || "SONI YOGESH JAGDISH",
      district: data.district || "Washim",
      membershipNo: data.registrationNo || "WASH/25022/2603013",
      validTill: validUpTo
   };

   return (
      <div ref={ref} className="flex flex-col gap-12 bg-slate-100 p-12 print:p-0 print:bg-transparent print:gap-0">

         {/* PAGE 1 - Application Form */}
         <div className="bg-white w-[210mm] h-[297mm] mx-auto text-black font-serif p-[20mm] shadow-2xl relative print:shadow-none print:m-0 print:break-inside-avoid print:break-after-page page-break-after">
            {/* Border Box */}
            <div className="absolute inset-[10mm] border-2 border-black pointer-events-none" />

            <div className="relative z-10 h-full flex flex-col">
               {/* Header */}
               <div className="flex items-start justify-between mb-6 border-b-2 border-black pb-4">
                  <div className="w-24 h-24 border border-black p-1">
                     <img src="/Logo.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-grow text-center px-4">
                     <h1 className="text-2xl font-bold leading-tight uppercase tracking-tight">
                        Association of Clinical Laboratory <br /> Analysts & Practitioners
                     </h1>
                     <p className="text-[10px] font-bold mt-2 leading-relaxed">
                        Admin office : Mahakashi CS, No 683/5, Plot No 21., Gondkar Mala, Sangli Road, Ichalkaranji 416115.<br />
                        Reg.No.S.R.Act.MAH/1076/2005/Pune.B.P.T. Act.F.21158/Pune. <br />
                        Email : aclapasso@gmail.com
                     </p>
                  </div>
                  <div className="w-24 h-24 border-2 border-black border-dashed flex items-center justify-center text-[10px] text-center font-bold px-2">
                     {data.profilePhoto ? (
                        <img src={data.profilePhoto} className="w-full h-full object-cover" />
                     ) : (
                        "Affix Passport Size Photo"
                     )}
                  </div>
               </div>

               <h2 className="text-center text-lg font-bold underline decoration-2 underline-offset-4 mb-8">
                  MEMBERSHIP APPLICATION FORM
               </h2>

               <div className="text-[12px] space-y-4 flex-grow">
                  <div className="flex flex-col gap-1">
                     <p className="font-bold">To,</p>
                     <p className="font-bold">The Secretary,</p>
                     <p className="font-bold">ACLAP, Maharashtra State.</p>
                  </div>

                  <p className="font-bold mt-4">Dear Sir,</p>
                  <p className="text-justify leading-relaxed">
                     I am willing to be member of Association of Clinical Laboratory Analysts & Practitioners.
                     I have read all the rules & regulation & declare that I shall abide by them.
                     As per my qualification I am applying for following type of membership along with the respective payment.
                     My Particulars are as follows:
                  </p>

                  <div className="space-y-6 mt-8">
                     <div className="flex border-b border-dotted border-black pb-1">
                        <span className="font-bold w-48 shrink-0">1. Name : Mr./Mrs./Ms.</span>
                        <span className="uppercase font-bold tracking-wider">{data.fullName}</span>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="flex border-b border-dotted border-black pb-1">
                           <span className="font-bold w-32 shrink-0">2. Date of Birth :</span>
                           <span className="font-bold">{data.dob || "      /      /      "}</span>
                        </div>
                        <div className="flex border-b border-dotted border-black pb-1">
                           <span className="font-bold w-32 shrink-0">3. Reg. No. :</span>
                           <span className="font-bold uppercase">{data.registrationNo || "________________"}</span>
                        </div>
                     </div>

                     <div className="flex border-b border-dotted border-black pb-1">
                        <span className="font-bold w-48 shrink-0">4. Qualification :</span>
                        <span className="font-bold uppercase">{data.qualification || "____________________________________"}</span>
                     </div>

                     <div className="flex border-b border-dotted border-black pb-1">
                        <span className="font-bold w-48 shrink-0">5. Name of Lab / Org. :</span>
                        <span className="font-bold uppercase">{data.organization || "____________________________________"}</span>
                     </div>

                     <div className="flex border-b border-dotted border-black pb-1">
                        <span className="font-bold w-48 shrink-0">6. Address of Lab :</span>
                        <span className="font-bold">{data.address || "____________________________________"}</span>
                     </div>

                     <div className="grid grid-cols-3 gap-8">
                        <div className="flex border-b border-dotted border-black pb-1 col-span-2">
                           <span className="font-bold w-24 shrink-0">Dist. :</span>
                           <span className="font-bold uppercase">{data.district || "________________"}</span>
                        </div>
                        <div className="flex border-b border-dotted border-black pb-1">
                           <span className="font-bold w-24 shrink-0">PIN :</span>
                           <span className="font-bold">{data.pincode || "______"}</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="flex border-b border-dotted border-black pb-1">
                           <span className="font-bold w-32 shrink-0">Office Phone :</span>
                           <span className="font-bold">{data.officePhone || "________________"}</span>
                        </div>
                        <div className="flex border-b border-dotted border-black pb-1">
                           <span className="font-bold w-32 shrink-0">Mobile No. :</span>
                           <span className="font-bold">{data.phone || "________________"}</span>
                        </div>
                     </div>

                     <div className="flex border-b border-dotted border-black pb-1">
                        <span className="font-bold w-48 shrink-0">Email :</span>
                        <span className="font-bold">{data.email || "____________________________________"}</span>
                     </div>
                  </div>

                  <div className="mt-12">
                     <h3 className="font-bold text-center underline mb-4">TYPES OF MEMBERSHIP</h3>
                     <table className="w-full border-2 border-black border-collapse">
                        <tbody>
                           <tr className="font-bold text-center">
                              <td className="border-2 border-black p-2 w-1/2">New Registration Fees <br /> Rs. 10,000/-</td>
                              <td className="border-2 border-black p-2 w-1/2">Renewal Membership Fees <br /> Rs. 5,000/-</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>

               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none z-0">
                  <img src="/Logo.png" alt="Watermark" className="w-[500px] grayscale" />
               </div>
            </div>
         </div>

         {/* PAGE 2 - Documents & Office Use */}
         <div className="bg-white w-[210mm] h-[297mm] mx-auto text-black font-serif p-[20mm] shadow-2xl relative print:shadow-none print:m-0 print:break-inside-avoid print:break-after-page page-break-after">
            {/* Border Box */}
            <div className="absolute inset-[10mm] border-2 border-black pointer-events-none" />

            <div className="relative z-10 h-full flex flex-col">
               <h3 className="font-bold text-[13px] mb-4">Attached attested Xerox Copies of:-</h3>
               <table className="w-full border-2 border-black border-collapse text-[12px]">
                  <thead>
                     <tr className="font-bold">
                        <th className="border-2 border-black p-2 w-16 text-center">No.</th>
                        <th className="border-2 border-black p-2 text-left">Document</th>
                        <th className="border-2 border-black p-2 w-48 text-center">Attached Copies</th>
                     </tr>
                  </thead>
                  <tbody>
                     {[
                        "Registration No.", "Adhar Card", "Bio-Waste Medical Certificate",
                        "Certificate of any Sp. Course / Award", "Educational Qualification",
                        "Pan Card", "Shop Act / Establishment Document", "Visiting Card / Letter Head"
                     ].map((item, idx) => (
                        <tr key={idx} className="h-10">
                           <td className="border-2 border-black p-1 text-center font-bold">{idx + 1}</td>
                           <td className="border-2 border-black p-2 font-bold uppercase">{item}</td>
                           <td className="border-2 border-black p-1 text-center">
                              {idx === 4 && data.degreeCertificate ? "YES" : ""}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>

               <div className="mt-8 space-y-4 text-[13px] font-bold">
                  <div className="flex border-b border-dotted border-black pb-1">
                     <span className="w-64">Please find enclosed a D.D. of Rs :</span>
                     <span className="grow">________________________________</span>
                  </div>
                  <div className="flex border-b border-dotted border-black pb-1">
                     <span className="w-64">Name of the Bank :</span>
                     <span className="grow uppercase">________________________________</span>
                  </div>
                  <div className="flex border-b border-dotted border-black pb-1">
                     <span className="w-64">Online UPI Transaction No. :</span>
                     <span className="grow">________________</span>
                     <span className="ml-4">Date :</span>
                     <span className="w-24 text-center">/    /</span>
                  </div>
               </div>

               <div className="mt-auto grid grid-cols-2 gap-20 pb-8">
                  <div className="text-center pt-8 border-t-2 border-black">
                     <p className="text-[11px] font-bold uppercase tracking-tight">Dist. Head / EC Signature</p>
                  </div>
                  <div className="text-center pt-8 border-t-2 border-black">
                     <p className="text-[11px] font-bold uppercase tracking-tight">Signature of Applicant</p>
                  </div>
               </div>

               <div className="border-2 border-black border-dashed p-6">
                  <h3 className="text-center font-bold underline mb-6 text-[14px]">OFFICE USE ONLY:-</h3>
                  <div className="space-y-4 text-[12px] font-bold">
                     <div className="flex gap-2">
                        <span>Online UPI Cheque Deposited in Bank :</span>
                        <span className="grow border-b border-black"></span>
                        <span>Date :</span>
                        <span className="w-32 border-b border-black text-center">/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</span>
                     </div>
                     <div className="flex gap-2">
                        <span>Online UPI or Cheque Clearing Date :</span>
                        <span className="grow border-b border-black"></span>
                     </div>
                     <div className="flex gap-2">
                        <span>Membership Certificate or G.P Issued Date :</span>
                        <span className="grow border-b border-black"></span>
                     </div>
                     <div className="grid grid-cols-2 gap-8">
                        <div className="flex gap-2">
                           <span>Membership No. :</span>
                           <span className="grow border-b border-black"></span>
                        </div>
                        <div className="flex gap-2">
                           <span>G.P No. :</span>
                           <span className="grow border-b border-black"></span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                     <div className="text-center">
                        <div className="w-48 h-px bg-black mb-1" />
                        <p className="text-[10px] font-bold uppercase">Signature & Stamp</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none z-0">
               <img src="/Logo.png" alt="Watermark" className="w-[500px] grayscale" />
            </div>
         </div>

         {/* PAGE 3 - MEMBERSHIP CERTIFICATE (Styled like MembershipCertificate component) */}
         <div className="bg-white w-[297mm] h-[210mm] mx-auto text-black font-sans p-[15mm] shadow-2xl relative print:shadow-none print:m-0 print:break-inside-avoid overflow-hidden">
            {/* Outer Border */}
            <div className="absolute inset-[10mm] border border-slate-200 pointer-events-none z-10" />

            {/* Gold Inner Border */}
            <div className="absolute inset-[12mm] border-2 border-[#cda036] pointer-events-none z-10" />

            {/* Background Pattern - subtle dots */}
            <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{
               backgroundImage: `radial - gradient(#000 1px, transparent 1px)`,
               backgroundSize: `24px 24px`
            }} />

            {/* Top Left Decoration */}
            <div className="absolute top-0 left-0 w-[350px] h-[350px] z-0 pointer-events-none">
               <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  <polygon points="0,0 100,0 0,100" fill="#f1f5f9" />
                  <polygon points="0,0 75,0 0,75" fill="#cbd5e1" />
                  <polygon points="0,0 60,0 0,60" fill="#cda036" />
                  <polygon points="0,0 45,0 0,45" fill="#1e3a8a" />
               </svg>
            </div>

            {/* Bottom Right Decoration */}
            <div className="absolute bottom-0 right-0 w-[350px] h-[350px] z-0 pointer-events-none">
               <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  <polygon points="100,100 0,100 100,0" fill="#f1f5f9" />
                  <polygon points="100,100 25,100 100,25" fill="#cbd5e1" />
                  <polygon points="100,100 40,100 100,40" fill="#cda036" />
                  <polygon points="100,100 55,100 100,55" fill="#1e3a8a" />
               </svg>
            </div>

            {/* Right side floating icons - placed right-[95px] to ensure they reside fully inside the border margin */}
            <div className="absolute top-[180px] right-[95px] flex flex-col gap-6 opacity-85 z-10 pointer-events-none">
               <div className="w-[54px] h-[54px] rounded-full bg-slate-100 flex items-center justify-center shadow-sm border border-slate-200 translate-x-4">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M6 22h12" />
                     <path d="M10 22V17a3 3 0 0 1 3-3h2" />
                     <path d="M16 14V4a2 2 0 0 0-2-2h-2" />
                     <path d="M9 6h6" />
                     <path d="M8 10h4" />
                     <circle cx="9" cy="14" r="2" />
                  </svg>
               </div>
               <div className="w-[54px] h-[54px] rounded-full bg-sky-50 flex items-center justify-center shadow-sm border border-sky-100 translate-x-10">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M4.5 10.5c0-5.5 15-5.5 15 0c0 5.5-15 5.5-15 11" />
                     <path d="M19.5 10.5c0-5.5-15-5.5-15 0c0 5.5 15 5.5 15 11" />
                     <path d="M6 8h12" />
                     <path d="M4.5 13.5h15" />
                     <path d="M6 16h12" />
                  </svg>
               </div>
               <div className="w-[54px] h-[54px] rounded-full bg-amber-50 flex items-center justify-center shadow-sm border border-amber-100 translate-x-0">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                     <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                     <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(30 12 12)" />
                     <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(90 12 12)" />
                     <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(150 12 12)" />
                  </svg>
               </div>
               <div className="w-[54px] h-[54px] rounded-full bg-green-50 flex items-center justify-center shadow-sm border border-green-100 translate-x-10">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M10 2h4" />
                     <path d="M12 2v6" />
                     <path d="M8 8h8l4 10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L8 8z" />
                     <path d="M6 16h12" />
                  </svg>
               </div>
               <div className="w-[54px] h-[54px] rounded-full bg-rose-50 flex items-center justify-center shadow-sm border border-rose-100 translate-x-2">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <circle cx="12" cy="5" r="2.5" fill="currentColor" />
                     <circle cx="5" cy="12" r="2.5" fill="currentColor" />
                     <circle cx="19" cy="12" r="2.5" fill="currentColor" />
                     <circle cx="12" cy="19" r="2.5" fill="currentColor" />
                     <line x1="12" y1="7.5" x2="12" y2="16.5" />
                     <line x1="7.5" y1="12" x2="16.5" y2="12" />
                     <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
                     <line x1="8.5" y1="15.5" x2="15.5" y2="8.5" />
                  </svg>
               </div>
            </div>

            {/* Registration Info Top Right */}
            <div className="absolute top-[14mm] right-[16mm] text-right z-10 text-[10px] font-bold text-slate-800 tracking-wide font-sans leading-tight">
               <p>Reg. No. 5.R.Act.MAH/1076/2005/Pune.</p>
               <p>B.P.T.Act. F-21158/ Pune.</p>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
               {/* Header Section */}
               <div className="flex items-center mt-6 px-10">
                  <div className="w-[100px] h-[100px] shrink-0 bg-white rounded-full flex items-center justify-center p-1 border-2 border-[#cda036] shadow-sm">
                     <div className="w-full h-full rounded-full flex items-center justify-center bg-white overflow-hidden p-1 border border-red-500">
                        <img
                           src="/Logo.png"
                           alt="ACLAP Logo"
                           className="w-full h-full object-contain"
                        />
                     </div>
                  </div>
                  <div className="flex-1 text-center px-6">
                     <h1 className="text-[28px] font-black text-[#e31837] leading-[1.2] uppercase tracking-wide font-sans">
                        ASSOCIATION OF CLINICAL LABORATORY
                        <br />
                        ANALYSTS & PRACTITIONERS
                     </h1>
                     <div className="w-[85%] h-[1.5px] bg-[#cda036] mx-auto my-1.5" />
                     <p className="text-[12px] font-bold text-slate-700 font-sans">
                        Admin office : Mahakashi CS, No 683/5, Plot No 21., Gondkar Mala, Sangali Road, Ichalkaranji 416115.
                     </p>
                  </div>
                  {/* Invisible spacer to perfectly balance the logo on the left */}
                  <div className="w-[100px] shrink-0" />
               </div>

               {/* Title */}
               <div className="text-center my-2">
                  <div className="inline-block bg-[#f3f4f6] border-2 border-slate-300 rounded-xl px-16 py-2 shadow-sm relative">
                     <div className="absolute inset-[2px] border border-pink-300 rounded-lg pointer-events-none"></div>
                     <h2 className="text-[24px] font-extrabold text-[#db2777] uppercase tracking-[0.1em] px-2" style={{ fontFamily: 'Georgia, serif' }}>
                        MEMBERSHIP CERTIFICATE
                     </h2>
                  </div>
               </div>

               {/* Dynamic Content */}
               <div className="flex-1 flex flex-col justify-center px-16 max-w-[850px] mx-auto w-full space-y-5 my-4">
                  <div className="flex items-end gap-3 text-[16px] font-bold text-slate-700">
                     <span className="shrink-0 pb-1">This is to certify that</span>
                     <div className="flex-1 border-b border-slate-300 pb-1 text-blue-900 text-[20px] font-extrabold text-center uppercase tracking-wider px-4">
                        {certificateData.name}
                     </div>
                  </div>

                  <div className="flex items-end gap-3 text-[16px] font-bold text-slate-700">
                     <span className="shrink-0 pb-1">District:</span>
                     <div className="w-[30%] border-b border-slate-300 pb-1 text-blue-900 text-[20px] font-extrabold text-center px-4 uppercase tracking-wider">
                        {certificateData.district}
                     </div>
                     <span className="shrink-0 pb-1">is a Member of the Association.</span>
                  </div>

                  <div className="flex items-end gap-3 text-[16px] font-bold text-slate-700">
                     <span className="shrink-0 pb-1">Membership No.</span>
                     <div className="flex-1 border-b border-slate-300 pb-1 text-blue-900 text-[20px] font-extrabold text-center px-4 uppercase tracking-wider">
                        {certificateData.membershipNo}
                     </div>
                  </div>

                  <div className="flex items-end gap-3 text-[16px] font-bold text-slate-700">
                     <span className="shrink-0 pb-1">Valid up to</span>
                     <div className="w-[35%] border-b border-slate-300 pb-1 text-blue-900 text-[20px] font-extrabold text-center px-4 tracking-wider">
                        {certificateData.validTill}
                     </div>
                  </div>
               </div>

               {/* Signatures & Seal */}
               <div className="flex justify-between items-end px-16 pb-6 relative z-10 mt-auto">
                  {/* President */}
                  <div className="text-center w-[200px]">
                     <div className="h-16 flex items-end justify-center mb-1">
                        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" className="translate-y-2">
                           <path
                              d="M 30 42 C 20 44, 18 25, 28 20 C 38 15, 38 35, 30 42 C 24 48, 38 25, 45 12 C 48 8, 42 50, 40 55 C 38 60, 48 40, 52 35 C 55 30, 60 42, 65 40"
                              stroke="#1a365d"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           />
                        </svg>
                     </div>
                     <p className="text-[14px] font-extrabold text-slate-800 uppercase tracking-wider font-sans">President</p>
                     <p className="text-[12px] font-bold text-pink-600 font-sans mt-0.5">Prashant Gulekar</p>
                  </div>

                  {/* Seal and Slogan */}
                  <div className="text-center flex flex-col items-center justify-end w-[350px]">
                     <div className="w-24 h-24 rotate-[-12deg] opacity-85 mb-2">
                        <svg viewBox="0 0 120 120" className="w-full h-full">
                           <defs>
                              <path id="seal-text-path-top" d="M 18 60 A 42 42 0 0 1 102 60" fill="none" />
                              <path id="seal-text-path-bottom" d="M 102 60 A 42 42 0 0 1 18 60" fill="none" />
                           </defs>
                           {/* Outer dotted circle */}
                           <circle cx="60" cy="60" r="54" stroke="#1e3a8a" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
                           {/* Outer solid circle */}
                           <circle cx="60" cy="60" r="50" stroke="#1e3a8a" strokeWidth="1" fill="none" />
                           {/* Inner solid circle */}
                           <circle cx="60" cy="60" r="34" stroke="#1e3a8a" strokeWidth="1" fill="none" />

                           {/* Circular Text */}
                           <text className="fill-blue-900 text-[5.5px] font-bold tracking-widest uppercase">
                              <textPath href="#seal-text-path-top" startOffset="50%" textAnchor="middle">
                                 ASSOCIATION OF CLINICAL LABORATORY
                              </textPath>
                           </text>
                           <text className="fill-blue-900 text-[5.5px] font-bold tracking-widest uppercase">
                              <textPath href="#seal-text-path-bottom" startOffset="50%" textAnchor="middle">
                                 ANALYSTS & PRACTITIONERS
                              </textPath>
                           </text>

                           {/* Center Text */}
                           <text x="60" y="42" textAnchor="middle" className="fill-blue-900 text-[5px] font-bold uppercase font-sans">Reg No.</text>
                           <text x="60" y="50" textAnchor="middle" className="fill-blue-900 text-[5px] font-bold uppercase font-sans">S.R.Act. MAH</text>
                           <text x="60" y="58" textAnchor="middle" className="fill-blue-900 text-[5px] font-bold uppercase font-sans">1076/2005/Pune</text>
                           <text x="60" y="66" textAnchor="middle" className="fill-blue-900 text-[5px] font-bold uppercase font-sans">B.P.T. Act</text>
                           <text x="60" y="74" textAnchor="middle" className="fill-blue-900 text-[5px] font-bold uppercase font-sans">F-21158/Pune</text>

                           {/* Star decorations in seal */}
                           <circle cx="18" cy="60" r="1.5" fill="#1e3a8a" />
                           <circle cx="102" cy="60" r="1.5" fill="#1e3a8a" />
                        </svg>
                     </div>
                     <p className="text-[13px] font-extrabold text-[#cda036] tracking-wide font-serif italic whitespace-nowrap mt-1">
                        I Proud... I am a Medical Lab Technologist...
                     </p>
                  </div>

                  {/* Secretary */}
                  <div className="text-center w-[200px]">
                     <div className="h-16 flex items-end justify-center mb-1">
                        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" className="translate-y-2">
                           {/* Outer Oval Circle */}
                           <path
                              d="M 48 54 C 38 54, 30 46, 30 35 C 30 24, 38 16, 48 16 C 58 16, 66 24, 66 35 C 66 46, 58 54, 48 54 Z"
                              stroke="#1a365d"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           />
                           {/* Inner P Shape */}
                           <path
                              d="M 44 23 L 44 47 M 44 23 C 51 23, 51 34, 44 34"
                              stroke="#1a365d"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           />
                           {/* Cursive right tail */}
                           <path
                              d="M 58 32 C 63 26, 68 18, 72 12 C 76 6, 74 22, 72 28 C 70 34, 78 20, 82 14 C 86 8, 88 6, 90 14 L 96 6"
                              stroke="#1a365d"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           />
                        </svg>
                     </div>
                     <p className="text-[14px] font-extrabold text-slate-800 uppercase tracking-wider font-sans">Secretary</p>
                     <p className="text-[12px] font-bold text-pink-600 font-sans mt-0.5">Ramesh Chougale</p>
                  </div>
               </div>
            </div>

            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none z-0">
               <img src="/Logo.png" alt="Watermark" className="w-[400px] grayscale" />
            </div>
         </div>

      </div>
   );
});

export default MembershipFormPDF;
