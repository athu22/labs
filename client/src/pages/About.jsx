import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Eye, Users, Award, BookOpen, Heart, Globe } from 'lucide-react';

const About = () => {
  const values = [
    { 
      title: 'Excellence', 
      desc: 'Committed to the highest standards of clinical laboratory science and professional practice.',
      icon: <Award size={24} className="text-primary-600" />
    },
    { 
      title: 'Integrity', 
      desc: 'Upholding ethical principles and transparency in every aspect of our clinical operations.',
      icon: <Shield size={24} className="text-emerald-600" />
    },
    { 
      title: 'Innovation', 
      desc: 'Embracing cutting-edge technology and research to lead the future of laboratory diagnostics.',
      icon: <Target size={24} className="text-blue-600" />
    },
    { 
      title: 'Community', 
      desc: 'Building a strong network of practitioners who support and elevate each other professionally.',
      icon: <Users size={24} className="text-purple-600" />
    }
  ];

  return (
    <div className="bg-white">
      
      {/* 1. Header Section */}
      <section className="pt-40 pb-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-6 text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
           >
              <span className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em] mb-4 inline-block">The Organization</span>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter mb-8 leading-tight">
                Our Mission to <br /> <span className="text-primary-600">Transform</span> Healthcare
              </h1>
              <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                Founded with a vision to unify and empower clinical laboratory analysts across the nation, ACLAP is the leading voice for professional excellence.
              </p>
           </motion.div>
        </div>
      </section>

      {/* 2. Vision & Mission Cards */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid md:grid-cols-2 gap-12">
              
              <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-2xl shadow-slate-900/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-[3rem] -z-10 transition-transform group-hover:scale-110" />
                 <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-primary-600/20">
                    <Eye size={32} />
                 </div>
                 <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Our Vision</h2>
                 <p className="text-slate-500 text-lg font-medium leading-relaxed">
                    To be the global benchmark for clinical laboratory associations, where every practitioner is recognized as a critical pillar of the healthcare ecosystem, powered by knowledge and ethical standards.
                 </p>
              </div>

              <div className="bg-slate-900 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-600/10 rounded-tr-[3rem] -z-10" />
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary-600 mb-8 shadow-xl">
                    <Target size={32} />
                 </div>
                 <h2 className="text-3xl font-black text-white mb-6 tracking-tight">Our Mission</h2>
                 <p className="text-slate-400 text-lg font-medium leading-relaxed">
                    To provide a unified platform for clinical analysts that facilitates continuous learning, advocates for professional rights, and ensures the highest quality of laboratory diagnostics for patients.
                 </p>
              </div>

           </div>
        </div>
      </section>

      {/* 2.5 Governance Hierarchy */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/5 blur-[120px] rounded-full -translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
             <span className="text-primary-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Organization Structure</span>
             <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">Governance <span className="text-primary-600">Hierarchy</span></h2>
             <p className="text-slate-500 max-w-2xl mx-auto mt-6 font-medium">A decentralized, democratic structure ensuring representation from every corner of Maharashtra.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-600 via-primary-200 to-transparent hidden md:block" />
            <div className="space-y-16">
              {[
                { level: '01', title: 'State Executive Committee', role: 'Central Policy & Vision', image: '/images/state-lead.png', desc: 'Supreme governing body responsible for state-wide clinical regulations, advocacy, and strategic partnerships.' },
                { level: '02', title: 'District Committee', role: 'Regional Administration', image: '/images/district-lead.png', desc: 'Governing units for each of the 36 districts, managing regional activities and member grievances.' },
                { level: '03', title: 'Taluka Representatives', role: 'Local Coordination', image: '/images/taluka-lead.png', desc: 'Point of contact for local laboratory practitioners, facilitating community workshops and registrations.' },
                { level: '04', title: 'General Body Members', role: 'Clinical Practitioners', image: '/images/member-lead.png', desc: 'The heartbeat of ACLAP—certified professionals upholding laboratory standards across the state.' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col md:flex-row items-center gap-8 md:gap-20 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="md:w-1/2 flex flex-col items-center md:items-end text-center md:text-right">
                    {i % 2 === 0 ? (
                      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 group hover:border-primary-600 transition-all max-w-sm overflow-hidden">
                        <div className="h-48 w-full bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                           <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        </div>
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 block">{item.level}</span>
                        <h3 className="text-xl font-black text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-primary-600 text-[9px] font-black uppercase tracking-widest mb-4">{item.role}</p>
                        <p className="text-slate-500 text-xs leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    ) : <div className="hidden md:block w-32 h-32" />}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-primary-600 border-4 border-white shadow-2xl flex items-center justify-center text-white font-black z-20 shrink-0">
                    {item.level}
                  </div>
                  <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                    {i % 2 !== 0 ? (
                      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 group hover:border-primary-600 transition-all max-w-sm overflow-hidden">
                        <div className="h-48 w-full bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100">
                           <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        </div>
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 block">{item.level}</span>
                        <h3 className="text-xl font-black text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-primary-600 text-[9px] font-black uppercase tracking-widest mb-4">{item.role}</p>
                        <p className="text-slate-500 text-xs leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    ) : <div className="hidden md:block w-32 h-32" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2.6 Membership Process */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-primary-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Joining ACLAP</span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-8">Membership <br /> <span className="text-primary-600">Verification Process</span></h2>
              <div className="space-y-10">
                {[
                  { step: '01', title: 'Digital Application', desc: 'Practitioner submits personal and professional credentials through our secure terminal.' },
                  { step: '02', title: 'Administrative Review', desc: 'District Executive Committees verify academic documents and registration numbers.' },
                  { step: '03', title: 'Fee Settlement', desc: 'Upon verification, members contribute to the association welfare fund.' },
                  { step: '04', title: 'Digital ID Issuance', desc: 'Official ACLAP Member ID and certificate are generated for physical record keeping.' },
                ].map((p, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="text-3xl font-black text-slate-200 group-hover:text-primary-600 transition-colors">{p.step}</div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 mb-2 tracking-tight group-hover:text-primary-600 transition-colors">{p.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary-600/5 blur-[100px] rounded-full -z-10" />
              <div className="bg-slate-900 rounded-[4rem] p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem]" />
                <Shield size={48} className="text-primary-600 mb-8" />
                <h3 className="text-3xl font-black mb-6 tracking-tight">Verified Security</h3>
                <p className="text-slate-400 text-lg leading-relaxed font-medium mb-10">
                  Our hierarchy and process ensure that only qualified practitioners represent the association, maintaining the highest level of professional trust.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-6 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">ISO Certified</div>
                  <div className="px-6 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Govt. Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Values Grid */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-20">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Values We Live By</h2>
              <p className="text-slate-500 font-medium mt-4">Foundation of our professional community</p>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((v, i) => (
                <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 hover:border-primary-100 transition-all hover:shadow-2xl hover:shadow-primary-600/5 group text-center">
                   <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      {v.icon}
                   </div>
                   <h3 className="text-lg font-black text-slate-800 mb-4 tracking-tight">{v.title}</h3>
                   <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      {v.desc}
                   </p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. Impact Statistics */}
      <section className="py-32 bg-white overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-3 gap-16">
               <div className="text-center">
                  <div className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">15+</div>
                  <p className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em]">Years of Leadership</p>
                  <p className="text-slate-400 text-sm mt-4 font-medium px-8">Guiding the clinical laboratory profession since our inception.</p>
               </div>
               <div className="text-center">
                  <div className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">500+</div>
                  <p className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em]">Hospitals Network</p>
                  <p className="text-slate-400 text-sm mt-4 font-medium px-8">Strong partnerships with leading healthcare institutions.</p>
               </div>
               <div className="text-center">
                  <div className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">10k</div>
                  <p className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em]">Certified Members</p>
                  <p className="text-slate-400 text-sm mt-4 font-medium px-8">A massive community of qualified and verified professionals.</p>
               </div>
            </div>
         </div>
      </section>

      {/* 5. Team / Board CTA */}
      <section className="py-32">
         <div className="max-w-7xl mx-auto px-6">
            <div className="bg-primary-600 rounded-[4rem] p-16 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
               {/* Decorative Circle */}
               <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
               
               <div className="max-w-xl text-center lg:text-left">
                  <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
                     Governed by Experts, <br /> Built for Professionals
                  </h2>
                  <p className="text-primary-100 text-lg font-medium leading-relaxed">
                     Our executive board consists of seasoned clinical laboratory directors and medical scientists committed to your professional growth.
                  </p>
               </div>
               <div className="shrink-0">
                  <button className="px-12 py-5 bg-white text-primary-600 font-black text-[13px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-xl active:scale-95">
                     View Executive Board
                  </button>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};

export default About;
