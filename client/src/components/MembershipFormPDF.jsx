import React, { forwardRef } from 'react';
import { Mail, Phone, MapPin, Calendar, User, Briefcase, FileText } from 'lucide-react';

const MembershipFormPDF = forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div ref={ref} className="flex flex-col gap-12 bg-slate-100 p-12 print:p-0 print:bg-transparent print:gap-0">
      
      {/* PAGE 1 */}
      <div className="bg-white w-[210mm] h-[297mm] mx-auto text-black font-serif p-[20mm] shadow-2xl relative print:shadow-none print:m-0 page-break-after">
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

      {/* PAGE 2 */}
      <div className="bg-white w-[210mm] h-[297mm] mx-auto text-black font-serif p-[20mm] shadow-2xl relative print:shadow-none print:m-0">
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

    </div>
  );
});

export default MembershipFormPDF;
