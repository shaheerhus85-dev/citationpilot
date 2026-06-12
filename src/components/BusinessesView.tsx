import React, { useState } from 'react';
import { 
  Building2, Globe, Phone, MapPin, Plus, ArrowRight, ArrowLeft, 
  CheckCircle, HelpCircle, AlertOctagon, FileText, Calendar, Trash2 
} from 'lucide-react';
import { BusinessProfile } from '../types';

interface BusinessesViewProps {
  businesses: BusinessProfile[];
  onAddBusiness: (profile: Omit<BusinessProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteBusiness?: (id: string) => void;
  theme: 'dark' | 'light';
}

export default function BusinessesView({ 
  businesses, 
  onAddBusiness, 
  onDeleteBusiness,
  theme 
}: BusinessesViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('United States');
  const [postalCode, setPostalCode] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [secondaryCategories, setSecondaryCategories] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [openingHours, setOpeningHours] = useState('Mon-Fri: 9:00 AM - 5:00 PM');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [youtube, setYoutube] = useState('');
  const [twitter, setTwitter] = useState('');
  const [notes, setNotes] = useState('');

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    if (!businessName || !phone || !address || !city || !website) {
      alert('Please fill out the primary fields (Name, Phone, Address, City, Website) before saving.');
      return;
    }

    onAddBusiness({
      workspaceId: 'w1',
      businessName,
      legalName,
      website,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      mainCategory: mainCategory || 'Local Business',
      secondaryCategories,
      shortDescription,
      longDescription,
      openingHours,
      facebook,
      instagram,
      linkedIn,
      youtube,
      twitter,
      notes
    });

    // Reset wizard
    setIsCreating(false);
    setStep(1);
    setBusinessName('');
    setLegalName('');
    setWebsite('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setState('');
    setPostalCode('');
    setMainCategory('');
    setSecondaryCategories('');
    setShortDescription('');
    setLongDescription('');
    setOpeningHours('Mon-Fri: 9:00 AM - 5:00 PM');
    setFacebook('');
    setInstagram('');
    setLinkedIn('');
    setYoutube('');
    setTwitter('');
    setNotes('');
  };

  const textClass = theme === 'dark' ? 'text-gray-300' : 'text-slate-700';
  const labelClass = "block text-[10px] sm:text-xs font-semibold mb-1 uppercase tracking-wider text-gray-400";
  const inputClass = `w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
    theme === 'dark' ? 'bg-[#18181b] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
  }`;

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">
            {isCreating ? 'Prepare Business NAP Profile' : 'Business Agency Profiles'}
          </h1>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
            {isCreating 
              ? 'Consolidate name, physical address, phone coordinates, categories, and working hours.' 
              : 'Add client directories and configure unified NAP schema details for consistent search indexes.'}
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Business Profile
          </button>
        )}
      </div>

      {/* NAP CONSISTENCY WARNING BANNER */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
        theme === 'dark' ? 'bg-[#312e81]/15 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
      }`}>
        <AlertOctagon className="w-5 h-5 shrink-0 text-indigo-400 mt-0.5" />
        <div>
          <strong>Primary SEO NAP Compliance Warning:</strong> Local citation validity depends heavily on exact 100% consistency 
          of Name, Address, and Phone details. Verify punctuation, suite details, phone formats, and spelling, 
          as mismatching inputs represent the root cause of 92% of search authority dilution.
        </div>
      </div>

      {/* LIST VIEW SCREEN */}
      {!isCreating && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((b) => (
            <div 
              key={b.id} 
              className={`rounded-2xl border p-5 transition-all relative flex flex-col justify-between ${
                theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06] hover:border-white/[0.12]' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold text-sm truncate">{b.businessName}</h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-sky-500/15 text-sky-400 font-bold uppercase">{b.mainCategory}</span>
                  </div>
                </div>

                {/* NAP coordinates details */}
                <div className="mt-4 space-y-2.5 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="truncate">{b.address}, {b.city}, {b.state} {b.postalCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>{b.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate text-sky-400">{b.website}</span>
                  </div>
                  {b.openingHours && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span className="truncate text-[11px]">{b.openingHours}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-500/10 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Created: {new Date(b.createdAt).toLocaleDateString()}</span>
                
                {onDeleteBusiness && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete profile: ${b.businessName}?`)) {
                        onDeleteBusiness(b.id);
                      }
                    }}
                    className={`p-1.5 rounded-lg hover:bg-red-500/10 text-red-500/75 hover:text-red-500 cursor-pointer`}
                    title="Delete Business Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MULTI-STEP CREATION WIZARD SCREEN */}
      {isCreating && (
        <div className={`rounded-2xl border p-6 ${
          theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06]' : 'bg-white border-slate-200'
        }`}>
          
          {/* Progress stepper line */}
          <div className="flex items-center justify-between mb-8 max-w-xl mx-auto">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-initial">
                <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs border transition-all ${
                  step === s 
                    ? 'bg-sky-500 text-white border-sky-500 ring-4 ring-sky-500/20' 
                    : step > s 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : (theme === 'dark' ? 'bg-white/5 border-white/[0.08] text-gray-500' : 'bg-slate-50 border-slate-200 text-slate-400')
                }`}>
                  {s}
                </div>
                {s < 5 && (
                  <div className={`h-[1px] flex-1 mx-2 ${
                    step > s ? 'bg-indigo-600' : (theme === 'dark' ? 'bg-white/[0.08]' : 'bg-slate-200')
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-500 font-mono">STEP 0{step} OF 05</span>
            <h2 className="text-base font-bold font-display mt-1">
              {step === 1 && 'Basic Business Information'}
              {step === 2 && 'Consistent NAP & Contact Details'}
              {step === 3 && 'Category, Keywords & Brand Description'}
              {step === 4 && 'Aesthetic Hours & Active Social Connections'}
              {step === 5 && 'Verify Details Strategy Review'}
            </h2>
          </div>

          {/* STEP 1: Basic profiles */}
          {step === 1 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div>
                <label className={labelClass}>Public Business Name *</label>
                <input 
                  type="text" 
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)} 
                  placeholder="e.g. Demo Dental Campaign"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Legal Organization Entity / Registration Name</label>
                <input 
                  type="text" 
                  value={legalName} 
                  onChange={(e) => setLegalName(e.target.value)} 
                  placeholder="e.g. Demo Dental Campaign LLC"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Internal Strategy / Backstage Notes</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Specify list guidelines, Client manager requirements, custom exclusions..."
                  className={`${inputClass} h-20 resize-none`}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Phone, Website, address */}
          {step === 2 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Business Phone Coordinates *</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="e.g. +1 (555) 234-5678"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Corporate Website *</label>
                  <input 
                    type="text" 
                    value={website} 
                    onChange={(e) => setWebsite(e.target.value)} 
                    placeholder="e.g. https://www.apex-dentistry.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Contact Inquiries Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="e.g. contact@apex-dentistry.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Physical Street Address *</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="e.g. 450 Alpine Summit Dr, Suite 100"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>City *</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Denver" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State/Prov</label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="CO" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ZIP/Postal *</label>
                  <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="80202" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Country</label>
                <select 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  className={inputClass}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Categories & descriptions */}
          {step === 3 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Primary Category *</label>
                  <input 
                    type="text" 
                    value={mainCategory} 
                    onChange={(e) => setMainCategory(e.target.value)} 
                    placeholder="e.g. Dentist"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Secondary Category Keywords</label>
                  <input 
                    type="text" 
                    value={secondaryCategories} 
                    onChange={(e) => setSecondaryCategories(e.target.value)} 
                    placeholder="e.g. Family Dentist, Dental Implants"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Short Pitch / Description (SEO Meta)</label>
                <input 
                  type="text" 
                  value={shortDescription} 
                  onChange={(e) => setShortDescription(e.target.value)} 
                  placeholder="e.g. Modern, general and cosmetic family dental care in Denver"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Long Business Description</label>
                <textarea 
                  value={longDescription} 
                  onChange={(e) => setLongDescription(e.target.value)} 
                  placeholder="Detail treatments, professional affiliations, custom doctor values, or historical highlights..."
                  className={`${inputClass} h-24 resize-none`}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Hours & Socials */}
          {step === 4 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div>
                <label className={labelClass}>Standard Working Hours</label>
                <input 
                  type="text" 
                  value={openingHours} 
                  onChange={(e) => setOpeningHours(e.target.value)} 
                  placeholder="e.g. Mon-Fri: 9:00 AM - 5:00 PM"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Facebook Link</label>
                  <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/example" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Instagram Handle</label>
                  <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/example" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className={labelClass}>LinkedIn Page</label>
                  <input type="text" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/company/example" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>X / Twitter</label>
                  <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://twitter.com/example" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Verification Review Screen */}
          {step === 5 && (
            <div className="space-y-5 max-w-xl mx-auto text-left">
              <div className={`p-4 rounded-xl border space-y-3 ${
                theme === 'dark' ? 'bg-[#18181b] border-white/[0.04]' : 'bg-slate-50 border-slate-200'
              }`}>
                <h3 className="text-xs font-bold text-sky-400 font-display">SUMMARY NAP SPECIFICATIONS</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <span className="text-gray-500 font-semibold">Business:</span>
                  <span className="col-span-2 font-medium">{businessName || '(Missing Name)'}</span>

                  <span className="text-gray-500 font-semibold">Phone:</span>
                  <span className="col-span-2 font-mono font-bold text-emerald-400">{phone || '(Missing Phone)'}</span>

                  <span className="text-gray-500 font-semibold">Street Address:</span>
                  <span className="col-span-2 font-medium">{address || '(Missing Address)'}</span>

                  <span className="text-gray-500 font-semibold">Location:</span>
                  <span className="col-span-2 font-medium">{city}, {state} {postalCode}, {country}</span>

                  <span className="text-gray-500 font-semibold">Category:</span>
                  <span className="col-span-2 font-semibold text-indigo-400 font-mono">{mainCategory}</span>

                  <span className="text-gray-500 font-semibold">Hours:</span>
                  <span className="col-span-2 text-[11px]">{openingHours}</span>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-gray-500/20 p-4 text-xs flex gap-3 text-gray-400">
                <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                <span>
                  CitationPilot automatically pre-compiles these coordinates into listing-friendly JSON metadata blocks. 
                  Once configured, our assisted and automation engines will submit this profile to your chosen directories.
                </span>
              </div>
            </div>
          )}

          {/* Wizard navigation bar buttons */}
          <div className="mt-8 pt-4 border-t border-gray-500/10 flex items-center justify-between max-w-xl mx-auto">
            <button
              onClick={step === 1 ? () => setIsCreating(false) : handlePrev}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border cursor-pointer ${
                theme === 'dark' ? 'border-white/[0.06] hover:bg-white/5 text-gray-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span className="flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Back</span>
            </button>

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-600 text-white cursor-pointer flex items-center gap-1"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Save Business Profile
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
