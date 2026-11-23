import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../../services/supabase';
import {
  Users,
  UserPlus,
  Search,
  MapPin,
  Building2,
  Building,
  Phone,
  Mail,
  FileText,
  Check,
  X,
  Printer,
  Eye,
  Download,
  Filter,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Award,
  Plus,
  Calendar,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
  Tag,
  LayoutGrid,
  Table as TableIcon,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  UserCheck,
  Sparkles,
  FileSpreadsheet,
  FileUp,
  Upload,
  FileCheck,
  HelpCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MembershipFormPDF from '../../../components/MembershipFormPDF';

const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana',
  'Chandrapur', 'Chhatrapati Sambhajinagar', 'Dhule', 'Gadchiroli',
  'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur',
  'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar',
  'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad',
  'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane',
  'Wardha', 'Washim', 'Yavatmal'
];

const MembersSection = ({ members = [], pending = [], refresh }) => {
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'approved' | 'pending' | 'districts'
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [viewingReg, setViewingReg] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Bulk Excel Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importDistrict, setImportDistrict] = useState('Kolhapur');
  const [importFile, setImportFile] = useState(null);
  const [importPreviewData, setImportPreviewData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  // Local state for all members in case parent is syncing
  const [localMembers, setLocalMembers] = useState(members);
  const [loadingLocal, setLoadingLocal] = useState(false);

  const printRef = useRef();

  useEffect(() => {
    if (members && members.length > 0) {
      setLocalMembers(members);
    } else {
      fetchMembersLocal();
    }
  }, [members]);

  const fetchMembersLocal = async () => {
    setLoadingLocal(true);
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const normalized = (data || []).map((reg) => ({
        ...reg,
        fullName:
          reg.fullName ||
          reg.full_name ||
          [reg.firstName || reg.first_name, reg.fatherName || reg.father_name, reg.surname || reg.last_name]
            .filter(Boolean)
            .join(' '),
        firstName: reg.firstName || reg.first_name,
        fatherName: reg.fatherName || reg.father_name,
        motherName: reg.motherName || reg.mother_name,
        surname: reg.surname || reg.last_name,
        phone: reg.phone || reg.mobile || reg.phone_number,
        officePhone: reg.officePhone || reg.office_phone,
        dob: reg.dob || reg.date_of_birth,
        registrationNo: reg.registrationNo || reg.registration_no,
        membershipId: reg.membershipId || reg.membership_id || reg.registration_no || reg.registrationNo,
        organization: reg.organization || reg.lab_name,
        address: reg.address || reg.lab_address,
        pincode: reg.pincode || reg.pin_code,
        district: reg.district || 'Unassigned',
        taluka: reg.taluka || '',
        city: reg.city || '',
        qualification: reg.qualification || '',
        profilePhoto: reg.profilePhoto || reg.profile_photo || reg.photo_url,
        status: reg.status || 'pending',
        memberType: reg.member_type || reg.memberType || (reg.membership_id ? 'old' : 'new'),
        approvedAt: reg.approvedAt || reg.approved_at,
        createdAt: reg.createdAt || reg.created_at,
      }));
      setLocalMembers(normalized);
    } catch (err) {
      console.error('[fetchMembersLocal]', err);
    } finally {
      setLoadingLocal(false);
    }
  };

  // Initial Add Old Member form state
  const initialFormState = {
    membershipId: '',
    firstName: '',
    fatherName: '',
    surname: '',
    phone: '',
    email: '',
    district: 'Kolhapur',
    customDistrict: '',
    taluka: '',
    city: '',
    organization: '',
    qualification: 'DMLT',
    experience: '',
    address: '',
    pincode: '',
    dob: '',
    profilePhoto: '',
    memberType: 'old',
    status: 'approved',
  };
  const [formData, setFormData] = useState(initialFormState);

  // Approve / Reject Handler
  const handleAction = async (id, status) => {
    try {
      const updatePayload =
        status === 'approved'
          ? { status, approved_at: new Date().toISOString() }
          : { status };

      let { error } = await supabase
        .from('registrations')
        .update(updatePayload)
        .eq('id', id);

      if (error && status === 'approved') {
        const fallback = await supabase
          .from('registrations')
          .update({ status })
          .eq('id', id);
        error = fallback.error;
      }

      if (error) throw error;
      if (refresh) refresh();
      fetchMembersLocal();
    } catch (err) {
      console.error('Error updating registration status:', err);
      alert('Failed to update registration status. Please try again.');
    }
  };

  // --- Member Deletion States & Handlers ---
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Single Member Delete
  const handleDeleteMember = async (member) => {
    if (!member || !member.id) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', member.id);

      if (error) throw error;

      if (viewingReg?.id === member.id) {
        setViewingReg(null);
      }
      setSelectedMemberIds((prev) => prev.filter((id) => id !== member.id));
      setMemberToDelete(null);

      if (refresh) refresh();
      fetchMembersLocal();
    } catch (err) {
      console.error('[handleDeleteMember] Error:', err);
      alert('Failed to delete member: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  // Bulk Selected Members Delete
  const handleBulkDelete = async () => {
    if (!selectedMemberIds || selectedMemberIds.length === 0) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .in('id', selectedMemberIds);

      if (error) throw error;

      if (viewingReg && selectedMemberIds.includes(viewingReg.id)) {
        setViewingReg(null);
      }
      setSelectedMemberIds([]);
      setIsBulkDeleteModalOpen(false);

      if (refresh) refresh();
      fetchMembersLocal();
    } catch (err) {
      console.error('[handleBulkDelete] Error:', err);
      alert('Failed to delete selected members: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedMemberIds.length === filteredMembers.length && filteredMembers.length > 0) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map((m) => m.id));
    }
  };

  const toggleSelectMember = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add Old Member Handler
  const handleAddOldMember = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const memId = formData.membershipId.trim();
    const fName = formData.firstName.trim();
    const sName = formData.surname.trim();
    const phone = formData.phone.trim();
    const finalDistrict = (formData.district === 'Other' ? formData.customDistrict : formData.district).trim();

    if (!memId || !fName || !sName || !phone || !finalDistrict) {
      setFormError('Please fill in Member ID, First Name, Surname, Mobile Number, and District.');
      return;
    }

    setSavingMember(true);
    try {
      const fullName = `${fName} ${formData.fatherName.trim()} ${sName}`.replace(/\s+/g, ' ').trim();

      const insertPayload = {
        full_name: fullName,
        first_name: fName,
        father_name: formData.fatherName.trim(),
        surname: sName,
        phone: phone,
        email: formData.email.trim() || null,
        district: finalDistrict,
        taluka: formData.taluka.trim(),
        city: formData.city.trim() || finalDistrict,
        organization: formData.organization.trim() || 'Clinical Laboratory',
        qualification: formData.qualification.trim() || 'DMLT',
        experience: formData.experience.trim() || null,
        address: formData.address.trim() || finalDistrict,
        pincode: formData.pincode.trim() || null,
        dob: formData.dob || null,
        profile_photo: formData.profilePhoto.trim() || null,
        registration_no: memId,
        membership_id: memId,
        member_type: 'old',
        status: 'approved',
        approved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      let lastErr = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const { error: insErr } = await supabase.from('registrations').insert([insertPayload]);
        if (!insErr) {
          lastErr = null;
          break;
        }
        lastErr = insErr;
        const msg = insErr.message || '';
        const match = msg.match(/'([^']+)' column/) || msg.match(/column "([^"]+)" of relation/);
        const colToDrop = match?.[1];
        if (colToDrop && insertPayload[colToDrop] !== undefined) {
          delete insertPayload[colToDrop];
          continue;
        }
        break;
      }

      if (lastErr) throw lastErr;

      setFormSuccess(`Old Member ${fullName} (${memId}) added successfully!`);
      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormData(initialFormState);
        setFormSuccess('');
      }, 1200);

      if (refresh) refresh();
      fetchMembersLocal();
    } catch (err) {
      console.error('[handleAddOldMember] Error:', err);
      setFormError(err.message || 'Failed to add old member. Please try again.');
    } finally {
      setSavingMember(false);
    }
  };

  // Print PDF
  const handlePrint = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        .print-container, .print-container * { visibility: visible; }
        .print-container { position: absolute; left: 0; top: 0; width: 100%; }
        @page { size: A4; margin: 0; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  // --- Bulk Excel Import Helpers (Strict matching with ACLAP District Excel Format) ---
  const normalizeExcelRow = (row, defaultDistrict) => {
    const getVal = (...keys) => {
      for (const k of keys) {
        const cleanK = k.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        for (const rowKey of Object.keys(row)) {
          const cleanRowKey = rowKey.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          if (cleanRowKey === cleanK) {
            const v = row[rowKey];
            return v !== undefined && v !== null ? String(v).trim() : '';
          }
        }
      }
      return '';
    };

    // 1. Membership ID / Registration Number
    const memberId = getVal(
      'membership no', 'membershipno', 'membership_no', 'membership id', 'member id',
      'registration no', 'reg no', 'membership_id', 'registration_no', 'id',
      'सदस्यता क्रमांक', 'नोंदणी क्रमांक'
    );

    // 2. Full Name & Parts
    let fullName = getVal('name', 'fullname', 'full name', 'member name', 'नाव', 'सभासदाचे नाव');
    let firstName = getVal('first name', 'firstname', 'पहिले नाव');
    let fatherName = getVal('father name', 'fathername', 'middle name', 'वडिलांचे नाव');
    let surname = getVal('surname', 'last name', 'lastname', 'आडनाव');

    if (fullName) {
      const parts = fullName.trim().split(/\s+/);
      if (!firstName && parts.length === 1) {
        firstName = parts[0];
      } else if (!firstName && parts.length === 2) {
        firstName = parts[0];
        surname = parts[1];
      } else if (!firstName && parts.length >= 3) {
        firstName = parts[0];
        fatherName = parts[1];
        surname = parts.slice(2).join(' ');
      }
    } else if (firstName || surname) {
      fullName = [firstName, fatherName, surname].filter(Boolean).join(' ');
    }

    // 3. Mobile / Number
    const phoneRaw = getVal('number', 'mobilenumber', 'mobile', 'phone', 'phonenumber', 'contact', 'मोबाईल', 'मोबाईल क्र');
    const phone = phoneRaw ? phoneRaw.replace(/\D/g, '').slice(-10) : '';

    // 4. Gmail / Email
    const email = getVal('gmail', 'email', 'emailid', 'mail', 'email address', 'ईमेल') || null;

    // 5. Territory & Address
    const rowDistrict = getVal('district', 'जिल्हा');
    const finalDistrict = rowDistrict || defaultDistrict || 'Kolhapur';
    const address = getVal('add', 'address', 'full address', 'पत्ता') || finalDistrict;
    const taluka = getVal('taluka', 'तालुका');
    const city = getVal('city', 'village', 'गाव', 'शहर') || finalDistrict;
    const pincode = getVal('pincode', 'pin code', 'pin', 'पिन कोड');

    // 6. Professional & Metadata
    const organization = getVal('lab name', 'lab', 'laboratory', 'organization', 'company', 'लॅबचे नाव') || 'Clinical Laboratory';
    const qualification = getVal('qualification', 'degree', 'शिक्षण') || 'DMLT';
    const gender = getVal('grander', 'gender', 'sex', 'लिंग');
    const age = getVal('age', 'वय');
    const validUpto = getVal('valid up to', 'validupto', 'validity', 'expiry');
    const remark = getVal('remark', 'remarks', 'note', 'शेरा');

    return {
      membershipId: memberId,
      fullName: fullName || 'Association Member',
      firstName: firstName || (fullName ? fullName.split(' ')[0] : 'Member'),
      fatherName: fatherName || '',
      surname: surname || '',
      phone: phone || null,
      email: email || null,
      district: finalDistrict,
      address,
      taluka,
      city,
      organization,
      qualification,
      pincode: pincode || null,
      gender: gender || null,
      age: age || null,
      validUpto: validUpto || null,
      remark: remark || null,
    };
  };

  const handleDistrictChangeForImport = (newDist) => {
    setImportDistrict(newDist);
    if (importPreviewData && importPreviewData.length > 0) {
      setImportPreviewData((prev) =>
        prev.map((item) => ({
          ...item,
          district: item.district === importDistrict || !item.district ? newDist : item.district,
        }))
      );
    }
  };

  // Generates exact format matching user screenshot: KOLHAPUR.xlsx
  const handleDownloadSampleTemplate = () => {
    const target = importDistrict || 'Kolhapur';
    const districtUpper = target.toUpperCase();

    // District code prefix for Membership No.
    let code = districtUpper.slice(0, 3);
    if (districtUpper === 'KOLHAPUR') code = 'KOP';
    else if (districtUpper.includes('MUMBAI')) code = 'MUM';
    else if (districtUpper === 'PUNE') code = 'PUN';
    else if (districtUpper === 'NAGPUR') code = 'NAG';
    else if (districtUpper === 'NASHIK') code = 'NAS';
    else if (districtUpper === 'AURANGABAD' || districtUpper === 'CHHATRAPATI') code = 'CSN';
    else if (districtUpper === 'SOLAPUR') code = 'SOL';
    else if (districtUpper === 'SATARA') code = 'SAT';
    else if (districtUpper === 'SANGLI') code = 'SAN';

    const sampleAoa = [
      [`${districtUpper} DISTRICT`, '', '', '', '', '', '', '', '', ''],
      ['SR.NO.', 'NAME', 'MEMBERSHIP NO.', 'VALID UP TO', 'AGE', 'GRANDER', 'ADD', 'NUMBER', 'GMAIL', 'REMARK'],
      [1, 'SAMIR H. MUJAWAR', `${code}/25007/2504001`, '31/12/2026', '36', 'MALE', `${target}`, '9876543210', 'samir.mujawer@gmail.com', 'Active Member'],
      [2, 'BAHUBALI B. BALANNAWAR', `${code}/25007/2504002`, '31/12/2026', '42', 'MALE', `${target}`, '9822001122', 'bahubali@gmail.com', 'Active Member'],
      [3, 'AMIT B. BONGALE', `${code}/25007/2504003`, '31/12/2026', '39', 'MALE', `${target}`, '9422003344', 'amit.bongale@gmail.com', 'Active Member'],
      [4, 'MOHIN I. NADAF', `${code}/25007/2504004`, '31/12/2026', '34', 'MALE', `${target}`, '9765432100', 'mohin.nadaf@gmail.com', 'Active Member'],
      [5, 'UMESH A. SANKPAL', `${code}/25007/2504005`, '31/12/2026', '45', 'MALE', `${target}`, '9823456789', 'umesh.sankpal@gmail.com', 'Active Member'],
      [6, 'VAIBHAV D. SANKPAL', `${code}/25007/2504006`, '31/12/2026', '31', 'MALE', `${target}`, '9922110022', 'vaibhav.sankpal@gmail.com', 'Active Member'],
      [7, 'ROUSAN B. GIRI', `${code}/25007/2504007`, '31/12/2026', '37', 'MALE', `${target}`, '9850123456', 'rousan.giri@gmail.com', 'Active Member'],
      [8, 'ROHAN A. RANGATE', `${code}/25007/2504008`, '31/12/2026', '29', 'MALE', `${target}`, '9890123456', 'rohan.rangate@gmail.com', 'Active Member'],
      [9, 'SHUBHAM V. KURALE', `${code}/25007/2504009`, '31/12/2026', '28', 'MALE', `${target}`, '9730123456', 'shubham.kurale@gmail.com', 'Active Member'],
      [10, 'BHARAT S. KADAM', `${code}/25007/2504010`, '31/12/2026', '50', 'MALE', `${target}`, '9421123456', 'bharat.kadam@gmail.com', 'Active Member'],
      [11, 'KISAN S. SUTAR', `${code}/25007/2504011`, '31/12/2026', '48', 'MALE', `${target}`, '9822345678', 'kisan.sutar@gmail.com', 'Active Member'],
      [12, 'VISHAL S. GIRMAL', `${code}/25007/2504012`, '31/12/2026', '33', 'MALE', `${target}`, '9970123456', 'vishal.girmal@gmail.com', 'Active Member'],
      [13, 'REKHA SNEHAL RAMCHANDRA', `${code}/25007/2508027`, '31/12/2026', '38', 'FEMALE', `${target}`, '9860123456', 'rekha.ramchandra@gmail.com', 'Active Member'],
      [14, 'PATIL SWATI PRADEEP', `${code}/25007/2504020`, '31/12/2026', '32', 'FEMALE', `${target}`, '9822987654', 'swati.patil@gmail.com', 'Active Member'],
      [15, 'SHERKHAN SHAHEED AMIRHAMJA', `${code}/25007/2506015`, '31/12/2026', '41', 'MALE', `${target}`, '9423123456', 'sherkhan@gmail.com', 'Active Member'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleAoa);
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];
    ws['!cols'] = [
      { wch: 8 },  // SR.NO.
      { wch: 32 }, // NAME
      { wch: 22 }, // MEMBERSHIP NO.
      { wch: 14 }, // VALID UP TO
      { wch: 8 },  // AGE
      { wch: 12 }, // GRANDER
      { wch: 24 }, // ADD
      { wch: 15 }, // NUMBER
      { wch: 28 }, // GMAIL
      { wch: 20 }, // REMARK
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${districtUpper}.xlsx`);
  };

  const handleExcelFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        // Select first active sheet with cells
        let ws = null;
        let wsname = wb.SheetNames[0];
        for (const sName of wb.SheetNames) {
          const s = wb.Sheets[sName];
          if (s && s['!ref']) {
            ws = s;
            wsname = sName;
            break;
          }
        }
        if (!ws) ws = wb.Sheets[wsname];

        // 2D row array
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (!rows || rows.length === 0) {
          setImportError('Uploaded Excel sheet is empty. Please add member rows.');
          setImportPreviewData([]);
          return;
        }

        // Dynamically detect header row index (scanning first 10 rows)
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const rowStr = (rows[i] || []).map((c) => String(c).toLowerCase().trim()).join(' ');
          if (
            (rowStr.includes('name') || rowStr.includes('नाव')) &&
            (rowStr.includes('membership') || rowStr.includes('sr.no') || rowStr.includes('number') || rowStr.includes('no.'))
          ) {
            headerRowIdx = i;
            break;
          }
        }

        if (headerRowIdx === -1) {
          headerRowIdx = rows[0] && rows[0].length >= 3 ? 0 : 1;
        }

        // Detect district from row 0 banner (e.g. 'KOLHAPUR DISTRICT') or filename
        let detectedDist = '';
        if (headerRowIdx > 0) {
          for (let i = 0; i < headerRowIdx; i++) {
            const text = (rows[i] || []).join(' ');
            const match = text.match(/([a-zA-Z\s]+)\s+DISTRICT/i);
            if (match) {
              const matchedName = match[1].trim();
              const found = MAHARASHTRA_DISTRICTS.find(
                (d) => d.toLowerCase() === matchedName.toLowerCase()
              );
              if (found) detectedDist = found;
            }
          }
        }

        if (!detectedDist && file.name) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').trim().toLowerCase();
          const found = MAHARASHTRA_DISTRICTS.find(
            (d) => cleanName.includes(d.toLowerCase()) || d.toLowerCase().includes(cleanName)
          );
          if (found) detectedDist = found;
        }

        const effectiveDistrict = detectedDist || importDistrict || 'Kolhapur';
        if (detectedDist && detectedDist !== importDistrict) {
          setImportDistrict(detectedDist);
        }

        const rawHeaders = (rows[headerRowIdx] || []).map((h) => String(h || '').trim());

        const parsedRows = [];
        for (let r = headerRowIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0 || row.every((c) => String(c || '').trim() === '')) continue;
          const rowObj = {};
          rawHeaders.forEach((h, colIdx) => {
            rowObj[h] = row[colIdx] !== undefined ? String(row[colIdx]).trim() : '';
          });
          parsedRows.push(rowObj);
        }

        if (parsedRows.length === 0) {
          setImportError('No member data rows found underneath the header row.');
          setImportPreviewData([]);
          return;
        }

        const normalized = parsedRows
          .map((row) => normalizeExcelRow(row, effectiveDistrict))
          .filter((item) => Boolean(item.fullName || item.membershipId));

        if (normalized.length === 0) {
          setImportError('No valid member records found. Please ensure "NAME" or "MEMBERSHIP NO." columns exist.');
          setImportPreviewData([]);
          return;
        }

        setImportPreviewData(normalized);
      } catch (err) {
        console.error('[handleExcelFileChange] Excel parsing error:', err);
        setImportError('Failed to parse Excel file. Please upload a valid .xlsx, .xls or .csv file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExecuteImport = async () => {
    if (!importPreviewData || importPreviewData.length === 0) {
      setImportError('No valid member records found to import.');
      return;
    }

    setImporting(true);
    setImportError('');
    setImportSuccess('');

    try {
      const recordsToInsert = importPreviewData.map((m) => {
        const memId = (m.membershipId || `OLD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`).trim();
        return {
          full_name: m.fullName,
          first_name: m.firstName,
          father_name: m.fatherName,
          surname: m.surname,
          phone: m.phone,
          email: m.email,
          district: m.district || importDistrict,
          taluka: m.taluka,
          city: m.city || m.district || importDistrict,
          organization: m.organization || 'Clinical Laboratory',
          qualification: m.qualification || 'DMLT',
          address: m.address || m.district || importDistrict,
          pincode: m.pincode,
          registration_no: memId,
          membership_id: memId,
          member_type: 'old',
          status: 'approved',
          approved_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
      });

      const chunkSize = 25;
      let totalInserted = 0;

      for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
        const chunk = recordsToInsert.slice(i, i + chunkSize);

        let lastErr = null;
        for (let attempt = 0; attempt < 5; attempt++) {
          const { error: insErr } = await supabase.from('registrations').insert(chunk);
          if (!insErr) {
            lastErr = null;
            break;
          }
          lastErr = insErr;
          const msg = insErr.message || '';
          const match = msg.match(/'([^']+)' column/) || msg.match(/column "([^"]+)" of relation/);
          const colToDrop = match?.[1];
          if (colToDrop) {
            chunk.forEach((item) => delete item[colToDrop]);
            continue;
          }
          break;
        }

        if (lastErr) throw lastErr;
        totalInserted += chunk.length;
        setImportProgress({ current: totalInserted, total: recordsToInsert.length });
      }

      setImportSuccess(`Successfully imported ${totalInserted} members into ${importDistrict} district chapter!`);
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportPreviewData([]);
        setImportFile(null);
        setImportSuccess('');
        setImportProgress({ current: 0, total: 0 });
      }, 1500);

      if (refresh) refresh();
      fetchMembersLocal();
    } catch (err) {
      console.error('[handleExecuteImport] Error:', err);
      setImportError(err.message || 'Failed to import members. Please check file format.');
    } finally {
      setImporting(false);
    }
  };

  // Derive all unique districts with member counts
  const districtCounts = useMemo(() => {
    const counts = {};
    localMembers.forEach((m) => {
      const d = (m.district || 'Unassigned').trim();
      counts[d] = (counts[d] || 0) + 1;
    });
    return counts;
  }, [localMembers]);

  const activeDistrictsList = useMemo(() => {
    return Object.keys(districtCounts).sort((a, b) => districtCounts[b] - districtCounts[a]);
  }, [districtCounts]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return localMembers.filter((m) => {
      // 1. Tab Status Filter
      if (activeSubTab === 'approved' && m.status !== 'approved') return false;
      if (activeSubTab === 'pending' && m.status !== 'pending' && m.status !== 'verified') return false;

      // 2. District Filter
      if (selectedDistrict !== 'all') {
        const mDist = (m.district || '').toLowerCase().trim();
        const selDist = selectedDistrict.toLowerCase().trim();
        if (mDist !== selDist) return false;
      }

      // 3. Search Filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const full = (m.fullName || '').toLowerCase();
        const email = (m.email || '').toLowerCase();
        const phone = (m.phone || '').toLowerCase();
        const memId = (m.membershipId || m.registrationNo || '').toLowerCase();
        const org = (m.organization || '').toLowerCase();
        const dist = (m.district || '').toLowerCase();
        const taluka = (m.taluka || '').toLowerCase();
        const city = (m.city || '').toLowerCase();

        return (
          full.includes(term) ||
          email.includes(term) ||
          phone.includes(term) ||
          memId.includes(term) ||
          org.includes(term) ||
          dist.includes(term) ||
          taluka.includes(term) ||
          city.includes(term)
        );
      }

      return true;
    });
  }, [localMembers, activeSubTab, selectedDistrict, searchTerm]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredMembers.length === 0) {
      alert('No members to export.');
      return;
    }
    const headers = [
      'Member ID / Reg No',
      'Full Name',
      'Mobile',
      'Email',
      'District',
      'Taluka',
      'City',
      'Organization / Lab',
      'Qualification',
      'Member Type',
      'Status',
      'Created At',
    ];
    const rows = filteredMembers.map((m) => [
      `"${m.membershipId || m.registrationNo || ''}"`,
      `"${m.fullName || ''}"`,
      `"${m.phone || ''}"`,
      `"${m.email || ''}"`,
      `"${m.district || ''}"`,
      `"${m.taluka || ''}"`,
      `"${m.city || ''}"`,
      `"${m.organization || ''}"`,
      `"${m.qualification || ''}"`,
      `"${m.memberType || 'new'}"`,
      `"${m.status || ''}"`,
      `"${m.createdAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ACLAP_Members_${selectedDistrict}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalMembersCount = localMembers.length;
  const approvedCount = localMembers.filter((m) => m.status === 'approved').length;
  const pendingCount = localMembers.filter((m) => m.status === 'pending' || m.status === 'verified').length;
  const oldMembersCount = localMembers.filter((m) => m.memberType === 'old').length;
  const approvalRate = totalMembersCount > 0 ? Math.round((approvedCount / totalMembersCount) * 100) : 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Executive Command Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-50 border border-primary-200/70 text-primary-700 text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
              <span>ACLAP Registry • Maharashtra State Directory</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Member Directory & Territory Registry
            </h1>
            
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Verified clinical pathology practitioners, diagnostic lab owners, and active district chapter members.
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchMembersLocal}
              disabled={loadingLocal}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-all flex items-center gap-2 text-xs font-black"
              title="Refresh Members"
            >
              <RefreshCw size={14} className={loadingLocal ? 'animate-spin text-primary-600' : ''} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-all flex items-center gap-2 text-xs font-black"
              title="Download CSV"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" />
              <span>Export CSV</span>
            </button>

            {/* Bulk Import Excel Button with District Selection */}
            <button
              type="button"
              onClick={() => {
                setImportDistrict(selectedDistrict !== 'all' ? selectedDistrict : 'Kolhapur');
                setImportFile(null);
                setImportPreviewData([]);
                setImportError('');
                setImportSuccess('');
                setImportProgress({ current: 0, total: 0 });
                setIsImportModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-all flex items-center gap-2 text-xs font-black shadow-sm active:scale-95"
              title="Import Members from Excel (.xlsx, .xls, .csv)"
            >
              <FileUp size={15} className="text-emerald-600" />
              <span>Import Excel (एक्सेल आयात)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormError('');
                setFormSuccess('');
                setFormData(initialFormState);
                setIsAddModalOpen(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-primary-600/20 active:scale-95 transition-all"
            >
              <UserPlus size={16} />
              <span>+ Add Old Member (जुना सभासद जोडा)</span>
            </button>
          </div>
        </div>

        {/* 4 Smart KPI Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
              <Users size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Enrolled</p>
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 font-mono leading-none mt-1">
                {totalMembersCount} <span className="text-xs text-slate-400 font-bold">Members</span>
              </h4>
              <p className="text-[10px] text-slate-500 font-bold mt-1 truncate">
                {oldMembersCount} Old / {totalMembersCount - oldMembersCount} Online
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active & Verified</p>
              <h4 className="text-xl sm:text-2xl font-black text-emerald-600 font-mono leading-none mt-1">
                {approvedCount} <span className="text-xs text-slate-400 font-bold">({approvalRate}%)</span>
              </h4>
              <p className="text-[10px] text-emerald-600 font-bold mt-1 truncate">
                Eligible for Event ID Check
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
              <Clock size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Awaiting Review</p>
              <h4 className="text-xl sm:text-2xl font-black text-amber-600 font-mono leading-none mt-1">
                {pendingCount} <span className="text-xs text-slate-400 font-bold">Queue</span>
              </h4>
              <p className="text-[10px] text-slate-500 font-bold mt-1 truncate">
                {pendingCount > 0 ? 'Action required' : 'Zero backlog'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <MapPin size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Districts Active</p>
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 font-mono leading-none mt-1">
                {activeDistrictsList.length} <span className="text-xs text-slate-400 font-bold">/ 36</span>
              </h4>
              <p className="text-[10px] text-blue-600 font-bold mt-1 truncate">
                {Math.round((activeDistrictsList.length / 36) * 100)}% Maharashtra Span
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls Deck: SubTabs + District Filter + Search Bar + View Mode Switcher */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Sub-Tabs Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
            {[
              { id: 'all', label: 'All Members', count: totalMembersCount },
              { id: 'approved', label: 'Approved & Active', count: approvedCount },
              { id: 'pending', label: 'Pending Approvals', count: pendingCount },
              { id: 'districts', label: 'District Directory', count: activeDistrictsList.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  activeSubTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.2 rounded-full ${
                    activeSubTab === tab.id ? 'bg-primary-100 text-primary-700 font-black' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Right Tools: District Select & View Mode Toggle */}
          <div className="flex items-center gap-3">
            {/* Maharashtra District Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <MapPin size={14} className="text-primary-600 shrink-0" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
              >
                <option value="all">All Districts (सर्व जिल्हे) — {totalMembersCount}</option>
                {activeDistrictsList.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist} ({districtCounts[dist]})
                  </option>
                ))}
                <option disabled>──────────</option>
                {MAHARASHTRA_DISTRICTS.filter((d) => !districtCounts[d]).map((dist) => (
                  <option key={dist} value={dist}>
                    {dist} (0)
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle (Table vs Cards) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Dense Data Table View"
              >
                <TableIcon size={14} />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Search Input & Quick District Chips */}
        <div className="space-y-3 pt-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by Name, Member ID (LM-123), Mobile Number, Lab / Organization, District, or Taluka..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-20 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-primary-600 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-black bg-slate-200 px-2 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Active District Pill Scroller */}
          {activeDistrictsList.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 custom-scrollbar text-[11px]">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                <Filter size={10} /> Territory:
              </span>
              <button
                onClick={() => setSelectedDistrict('all')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                  selectedDistrict === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                All ({totalMembersCount})
              </button>
              {activeDistrictsList.map((dist) => (
                <button
                  key={dist}
                  onClick={() => setSelectedDistrict(dist)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    selectedDistrict === dist
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <MapPin size={10} />
                  <span>{dist}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                    selectedDistrict === dist ? 'bg-primary-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {districtCounts[dist]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Directory Display */}
      {loadingLocal ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-16 text-center shadow-sm">
          <Loader2 className="animate-spin text-primary-600 mx-auto mb-3" size={32} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing Member Records...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-16 text-center shadow-sm space-y-3">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Users size={24} />
          </div>
          <h3 className="text-base font-black text-slate-900">No Members Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm || selectedDistrict !== 'all'
              ? 'No member records match your active search filters. Try clearing filters or searching with another term.'
              : 'There are currently no registered members in the database. You can add old members using the button above.'}
          </p>
          {(searchTerm || selectedDistrict !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDistrict('all');
                setActiveSubTab('all');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : activeSubTab === 'districts' ? (
        /* District-wise Grouped View */
        <div className="space-y-5">
          {activeDistrictsList.map((dist) => {
            const distMembers = localMembers.filter((m) => (m.district || '').toLowerCase() === dist.toLowerCase());
            return (
              <div key={dist} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">{dist} District Chapter</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {distMembers.length} Registered Practitioners
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary-50 text-primary-700 font-black text-xs rounded-xl border border-primary-200/60">
                    {distMembers.length} Members
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {distMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setViewingReg(member)}
                      className="p-3.5 bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-primary-400 rounded-2xl cursor-pointer hover:shadow-md transition-all space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-black text-[10px] rounded-md">
                          {member.membershipId || member.registrationNo || 'NO-ID'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                            member.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                      <h4 className="font-black text-xs text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                        {member.fullName}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-500 truncate flex items-center gap-1.5">
                        <Building size={11} className="text-slate-400 shrink-0" />
                        {member.organization || 'Clinical Lab'}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                        <Phone size={11} className="text-slate-400 shrink-0" />
                        {member.phone || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {/* Batch Selection Action Bar */}
          {selectedMemberIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-rose-50/90 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm mb-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-sm">
                  {selectedMemberIds.length}
                </span>
                <div>
                  <p className="text-xs font-black text-rose-950">
                    {selectedMemberIds.length} Members Selected ({selectedMemberIds.length} सभासद निवडले)
                  </p>
                  <p className="text-[10px] text-rose-600 font-semibold">
                    निवडलेले सर्व सभासद एका क्लिकवर सिस्टीममधून हटवता येतील.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedMemberIds([])}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-rose-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Deselect All (निवड रद्द)
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20 active:scale-95"
                >
                  <Trash2 size={13} />
                  <span>Delete Selected ({selectedMemberIds.length})</span>
                </button>
              </div>
            </motion.div>
          )}

          {viewMode === 'table' ? (
            /* High-Density Enterprise Data Table View */
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredMembers.length > 0 && selectedMemberIds.length === filteredMembers.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer accent-primary-600"
                          title="Select All Members"
                        />
                      </th>
                      <th className="py-3.5 px-4">Member / Practitioner</th>
                      <th className="py-3.5 px-4">Member ID</th>
                      <th className="py-3.5 px-4">Territory / District</th>
                      <th className="py-3.5 px-4">Lab / Organization</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredMembers.map((reg) => {
                      const isApproved = reg.status === 'approved';
                      const isPending = reg.status === 'pending' || reg.status === 'verified';
                      const isOld = reg.memberType === 'old';
                      const isSelected = selectedMemberIds.includes(reg.id);

                      return (
                        <tr
                          key={reg.id}
                          className={`transition-colors group ${isSelected ? 'bg-rose-50/40' : 'hover:bg-slate-50/80'}`}
                        >
                          {/* Row Selection Checkbox */}
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectMember(reg.id)}
                              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer accent-primary-600"
                            />
                          </td>

                          {/* Member / Practitioner */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                {reg.profilePhoto ? (
                                  <img src={reg.profilePhoto} alt={reg.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-sm font-black text-primary-600">
                                    {reg.fullName?.charAt(0) || 'M'}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p
                                  onClick={() => setViewingReg(reg)}
                                  className="font-black text-slate-900 group-hover:text-primary-600 cursor-pointer truncate max-w-[200px]"
                                >
                                  {reg.fullName}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 truncate">
                                  {reg.qualification || 'Clinical Practitioner'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Member ID */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-black text-[11px] text-primary-700 bg-primary-50 border border-primary-200/80 px-2.5 py-1 rounded-lg inline-block">
                              {reg.membershipId || reg.registrationNo || 'UNASSIGNED'}
                            </span>
                          </td>

                          {/* Territory / District */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase">
                                <MapPin size={10} /> {reg.district || 'Unassigned'}
                              </span>
                              {(reg.taluka || reg.city) && (
                                <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[140px]">
                                  {[reg.taluka, reg.city].filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Lab / Organization */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-slate-700 max-w-[180px]">
                              <Building size={13} className="text-slate-400 shrink-0" />
                              <span className="font-bold truncate">{reg.organization || 'Diagnostic Lab'}</span>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-slate-700 font-semibold">
                                <Phone size={11} className="text-slate-400" />
                                <span>{reg.phone || '—'}</span>
                                {reg.phone && (
                                  <a
                                    href={`https://wa.me/91${reg.phone.replace(/\D/g, '').slice(-10)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700 ml-0.5"
                                    title="Chat on WhatsApp"
                                  >
                                    <MessageCircle size={12} />
                                  </a>
                                )}
                              </div>
                              {reg.email && (
                                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                  {reg.email}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Membership Type */}
                          <td className="py-3.5 px-4">
                            {isOld ? (
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-black uppercase tracking-wider">
                                Old Member
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 text-[9px] font-black uppercase tracking-wider">
                                New Online
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isPending
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isApproved ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-rose-500'
                              }`} />
                              {reg.status}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingReg(reg)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                                title="View Membership Form & Dossier"
                              >
                                <FileText size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setMemberToDelete(reg)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                                title="Delete Member (सभासद हटवा)"
                              >
                                <Trash2 size={14} />
                              </button>

                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleAction(reg.id, 'approved')}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase transition-all"
                                    title="Approve"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAction(reg.id, 'rejected')}
                                    className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-[10px] font-black uppercase transition-all"
                                    title="Reject"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Showing {filteredMembers.length} of {totalMembersCount} Total Members</span>
                <span>ACLAP State Database Verified</span>
              </div>
            </div>
          ) : (
        /* Modern Compact Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((reg) => {
            const isApproved = reg.status === 'approved';
            const isPending = reg.status === 'pending' || reg.status === 'verified';
            const isOld = reg.memberType === 'old';
            const isSelected = selectedMemberIds.includes(reg.id);

            return (
              <motion.div
                layout
                key={reg.id}
                className={`bg-white border rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 group ${
                  isSelected ? 'border-rose-400 bg-rose-50/20 shadow-md' : 'border-slate-200/90 hover:border-primary-400 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectMember(reg.id)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer accent-primary-600"
                        title="Select for bulk action"
                      />
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={9} /> {reg.district || 'Unassigned'}
                      </span>
                      {isOld && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-black uppercase tracking-wider">
                          Old Member
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isPending
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </div>

                  {/* Profile & Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                      {reg.profilePhoto ? (
                        <img src={reg.profilePhoto} alt={reg.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base font-black text-primary-600">
                          {reg.fullName?.charAt(0) || 'M'}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-mono font-black text-primary-600">
                        {reg.membershipId || reg.registrationNo || 'NO-ID'}
                      </p>
                      <h4
                        onClick={() => setViewingReg(reg)}
                        className="text-sm font-black text-slate-900 truncate hover:text-primary-600 cursor-pointer"
                      >
                        {reg.fullName}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-400 truncate">
                        {reg.qualification || 'Practitioner'}
                      </p>
                    </div>
                  </div>

                  {/* Lab & Info */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 truncate">
                      <Building size={12} className="text-slate-400 shrink-0" />
                      <span className="font-bold truncate">{reg.organization || 'Diagnostic Lab'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone size={12} className="text-slate-400 shrink-0" />
                      <span className="font-semibold">{reg.phone || '—'}</span>
                    </div>

                    {reg.email && (
                      <div className="flex items-center gap-1.5 text-slate-600 truncate">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className="font-semibold truncate">{reg.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingReg(reg)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all"
                    >
                      <FileText size={13} />
                      <span>View Dossier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberToDelete(reg)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                      title="Delete Member (सभासद हटवा)"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAction(reg.id, 'approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase transition-all"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(reg.id, 'rejected')}
                        className="px-2 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-black uppercase transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: BULK EXCEL IMPORT (एक्सेल मधून सभासद आयात)             */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isImportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl my-8 border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Bulk Import Members from Excel (एक्सेल आयात)
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Select target district, download template or upload existing member sheet (.xlsx, .xls, .csv)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[78vh] overflow-y-auto custom-scrollbar">
                {importError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2.5">
                    <AlertCircle size={18} className="shrink-0 text-rose-600" />
                    <span>{importError}</span>
                  </div>
                )}

                {importSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                    <span>{importSuccess}</span>
                  </div>
                )}

                {/* Step 1: Select District (CRITICAL USER REQUIREMENT!) */}
                <div className="p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <MapPin size={16} className="text-blue-600" />
                      1. Select Target District for Import (जिल्हा निवडा) *
                    </label>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      Required
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600">
                    सर्व आयात केलेले सभासद या निवडलेल्या जिल्ह्यामध्ये नोंदवले जातील (जर एक्सेल मधील ओळीत वेगळा जिल्हा नसेल तर).
                  </p>
                  <div className="pt-1">
                    <select
                      value={importDistrict}
                      onChange={(e) => handleDistrictChangeForImport(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-xl px-4 py-3 text-xs font-black text-slate-900 focus:border-primary-600 outline-none cursor-pointer shadow-sm"
                    >
                      {MAHARASHTRA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d} (महाराष्ट्र)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Standard Format Indicator */}
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-indigo-900 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shrink-0">
                      Standard ACLAP Format
                    </span>
                    <span className="text-[11px] text-indigo-800 font-semibold">
                      जिल्हा रजिस्टर फॉरमॅट (District Register Columns):
                    </span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] text-indigo-950 font-bold bg-white/80 px-2.5 py-1 rounded-lg border border-indigo-200/60 break-all">
                    SR.NO. • NAME • MEMBERSHIP NO. • VALID UP TO • AGE • GRANDER • ADD • NUMBER • GMAIL • REMARK
                  </span>
                </div>

                {/* Step 2: Download Sample Template & File Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Download Template Card */}
                  <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                        <Download size={15} className="text-emerald-600" />
                        <span>2. Sample Template (नमुना फाईल)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        तुमच्या जिल्ह्यातील सभासदांची माहिती भरण्यासाठी <strong>{importDistrict.toUpperCase()}.xlsx</strong> ही तयार नमुना फाईल डाउनलोड करा.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadSampleTemplate}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <FileSpreadsheet size={15} className="text-emerald-600" />
                      <span>Download {importDistrict.toUpperCase()}.xlsx Template</span>
                    </button>
                  </div>

                  {/* Upload File Card */}
                  <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                        <Upload size={15} className="text-primary-600" />
                        <span>3. Upload Excel / CSV (फाईल निवडा)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        तयार असलेली <strong>.xlsx</strong>, <strong>.xls</strong> किंवा <strong>.csv</strong> फाईल निवडा (Sheet1 वरील सर्व ओळी आपोआप वाचल्या जातील).
                      </p>
                    </div>

                    <label className="w-full cursor-pointer py-2.5 px-4 bg-primary-50 hover:bg-primary-100 border border-dashed border-primary-300 rounded-xl text-xs font-black text-primary-700 flex items-center justify-center gap-2 transition-all active:scale-95">
                      <FileUp size={15} />
                      <span className="truncate">
                        {importFile ? importFile.name : 'Choose Excel File (.xlsx, .csv)'}
                      </span>
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleExcelFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Step 3: Live Preview Table (if file uploaded) */}
                {importPreviewData.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <FileCheck size={16} className="text-emerald-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Data Preview ({importPreviewData.length} Members in {importDistrict})
                        </h4>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Ready to Import
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/90 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 sticky top-0 bg-slate-100 z-10">
                            <th className="py-2.5 px-3">SR.NO.</th>
                            <th className="py-2.5 px-3">NAME (सभासद नाव)</th>
                            <th className="py-2.5 px-3">MEMBERSHIP NO.</th>
                            <th className="py-2.5 px-3">DISTRICT</th>
                            <th className="py-2.5 px-3">NUMBER (मोबाईल)</th>
                            <th className="py-2.5 px-3">ADD (पत्ता)</th>
                            <th className="py-2.5 px-3">GMAIL</th>
                            <th className="py-2.5 px-3">GRANDER</th>
                            <th className="py-2.5 px-3">VALID UP TO</th>
                            <th className="py-2.5 px-3">REMARK</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {importPreviewData.slice(0, 15).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                              <td className="py-2 px-3 font-bold text-slate-900">{row.fullName}</td>
                              <td className="py-2 px-3 font-mono font-black text-primary-700 text-[11px] whitespace-nowrap">
                                {row.membershipId || 'AUTO-ID'}
                              </td>
                              <td className="py-2 px-3">
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                                  {row.district}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-600 font-mono whitespace-nowrap">
                                {row.phone || <span className="text-slate-300 italic">—</span>}
                              </td>
                              <td className="py-2 px-3 text-slate-600 truncate max-w-[140px]">
                                {row.address || <span className="text-slate-300 italic">—</span>}
                              </td>
                              <td className="py-2 px-3 text-slate-600 truncate max-w-[130px] font-mono text-[11px]">
                                {row.email || <span className="text-slate-300 italic">—</span>}
                              </td>
                              <td className="py-2 px-3 text-slate-600 uppercase text-[10px] font-bold">
                                {row.gender || <span className="text-slate-300 italic">—</span>}
                              </td>
                              <td className="py-2 px-3 text-slate-500 font-mono text-[10px] whitespace-nowrap">
                                {row.validUpto || <span className="text-slate-300 italic">—</span>}
                              </td>
                              <td className="py-2 px-3 text-slate-500 text-[10px] truncate max-w-[100px]">
                                {row.remark || <span className="text-slate-300 italic">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {importPreviewData.length > 10 && (
                      <p className="text-[10px] text-slate-400 font-bold text-center">
                        ...and {importPreviewData.length - 10} more rows ready for batch insertion.
                      </p>
                    )}

                    {/* Progress Bar when importing */}
                    {importing && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-black text-slate-700">
                          <span className="flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-primary-600" />
                            <span>Importing records into database...</span>
                          </span>
                          <span>
                            {importProgress.current} / {importProgress.total} (
                            {Math.round((importProgress.current / (importProgress.total || 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.round((importProgress.current / (importProgress.total || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Information Box */}
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl text-[11px] text-amber-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-600 shrink-0" />
                    <span>महत्त्वाची टीप (Important Note):</span>
                  </p>
                  <p className="text-slate-600 font-medium">
                    आयात केलेले सर्व सभासद थेट <strong>Approved</strong> स्थितीत नोंदवले जातील. त्यामुळे इव्हेंट नोंदणीच्या वेळी (Event Registration) त्यांनी Member ID टाकल्यावर त्यांचे नाव, मोबाईल व लॅबची माहिती आपोआप शोधली जाईल.
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    disabled={importing}
                    className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={importing || importPreviewData.length === 0}
                    onClick={handleExecuteImport}
                    className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {importing ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    <span>Import {importPreviewData.length > 0 ? `${importPreviewData.length} Members` : 'Excel'} to {importDistrict}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD OLD MEMBER (जुना सभासद जोडा)                       */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-600/20">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Add Old Member (जुना सभासद जोडा)
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Register offline / historical association member into digital registry
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleAddOldMember} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {formError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* Section 1: ID & Classification */}
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Award size={15} className="text-primary-600" />
                    1. Membership Identification (सदस्यता क्रमांक)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Member ID / Reg No * (e.g. LM-123 or WASH/25022/2603013)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. LM-123"
                        value={formData.membershipId}
                        onChange={(e) => setFormData({ ...formData, membershipId: e.target.value.toUpperCase() })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Classification Type
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Historical / Offline Registered Member (Old)"
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Personal & Contact */}
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <UserCheck size={15} className="text-primary-600" />
                    2. Personal & Contact Details (वैयक्तिक माहिती)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        First Name (नाव) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Father / Middle Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dnyaneshwar"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Surname (आडनाव) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Patil"
                        value={formData.surname}
                        onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Mobile Number * (10 Digits for WhatsApp)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Territory & Lab */}
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Building2 size={15} className="text-primary-600" />
                    3. Territory & Laboratory (जिल्हा व प्रयोगशाळा)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        District (जिल्हा) *
                      </label>
                      <select
                        required
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none cursor-pointer"
                      >
                        {MAHARASHTRA_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                        <option value="Other">Other / इतर</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Taluka (तालुका)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Karvir"
                        value={formData.taluka}
                        onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        City / Village (गाव / शहर)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kolhapur"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Lab Name (प्रयोगशाळेचे नाव)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shree Diagnostic Pathology Lab"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Qualification (शिक्षण)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DMLT / B.Sc. DMLT"
                        value={formData.qualification}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingMember}
                    className="px-7 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary-600/20 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {savingMember ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    <span>Save & Approve Old Member</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: FULL MEMBERSHIP FORM / DOCUMENT VIEWER                 */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {viewingReg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                      Membership Document Dossier
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      {viewingReg.district} District • {viewingReg.membershipId || viewingReg.registrationNo || 'New'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-all active:scale-95 shadow-md shadow-slate-900/10"
                  >
                    <Printer size={14} /> Download / Print A4
                  </button>
                  <button
                    onClick={() => setViewingReg(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Content - Scrollable Form */}
              <div className="flex-grow overflow-y-auto p-6 sm:p-10 bg-slate-100/70 custom-scrollbar flex justify-center">
                <div className="print-container w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6 sm:p-8">
                  <MembershipFormPDF ref={printRef} data={viewingReg} />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Status: {viewingReg.status} • {viewingReg.district}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const m = viewingReg;
                      setViewingReg(null);
                      setMemberToDelete(m);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
                    title="Delete Member (सभासद हटवा)"
                  >
                    <Trash2 size={13} />
                    <span>Delete Member (हटवा)</span>
                  </button>

                  {viewingReg.status !== 'approved' ? (
                    <>
                      <button
                        onClick={() => {
                          handleAction(viewingReg.id, 'rejected');
                          setViewingReg(null);
                        }}
                        className="text-xs font-black uppercase tracking-wider text-slate-500 hover:text-rose-600 transition-colors px-3 py-1.5"
                      >
                        Reject Application
                      </button>
                      <button
                        onClick={() => {
                          handleAction(viewingReg.id, 'approved');
                          setViewingReg(null);
                        }}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/10"
                      >
                        Approve & Grant ID
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setViewingReg(null)}
                      className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      Close Preview
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SINGLE MEMBER DELETE CONFIRMATION                      */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {memberToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Delete Member Record?
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold">
                    हा सभासद डेटाबेसमधून कायमचा हटवायचा आहे का?
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400">Full Name</span>
                  <span className="font-black text-slate-900 text-right">{memberToDelete.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400">Member ID</span>
                  <span className="font-mono font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                    {memberToDelete.membershipId || memberToDelete.registrationNo || 'No ID'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400">District</span>
                  <span className="font-bold text-slate-700">{memberToDelete.district || 'Unassigned'}</span>
                </div>
                {memberToDelete.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">Mobile</span>
                    <span className="font-mono text-slate-700">{memberToDelete.phone}</span>
                  </div>
                )}
                {memberToDelete.organization && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">Lab / Org</span>
                    <span className="text-slate-700 truncate max-w-[200px]">{memberToDelete.organization}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200/70 rounded-xl flex items-start gap-2 text-[11px] text-rose-700">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>
                  <strong>सावधान:</strong> हा सभासद हटवल्यानंतर त्यांची नोंद कायमची नष्ट होईल व त्यांना इव्हेंट नोंदणीच्या वेळी सभासद म्हणून ओळखता येणार नाही.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setMemberToDelete(null)}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                >
                  Cancel (रद्द करा)
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => handleDeleteMember(memberToDelete)}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  <span>{deleting ? 'Deleting...' : 'Yes, Delete Member'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: BULK DELETE CONFIRMATION                               */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isBulkDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Delete {selectedMemberIds.length} Members?
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold">
                    निवडलेले सर्व सभासद डेटाबेसमधून कायमचे हटवायचे आहेत का?
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400">Total Selected</span>
                  <span className="font-mono font-black text-rose-600 text-sm">
                    {selectedMemberIds.length} Records
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  तुम्ही निवडलेले <strong>{selectedMemberIds.length} सभासद</strong> डेटाबेसमधून कायमचे नष्ट होतील. ही क्रिया पुन्हा पूर्ववत करता येणार नाही.
                </p>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200/70 rounded-xl flex items-start gap-2 text-[11px] text-rose-700">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>
                  <strong>चेतावणी:</strong> डिलीट केल्यानंतर हे सर्व मेंबर्स डेटाबेस व इव्हेंट व्हॅलिडेशन सिस्टीममधून काढून टाकले जातील.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                >
                  Cancel (रद्द करा)
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleBulkDelete}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  <span>{deleting ? 'Deleting...' : `Yes, Delete ${selectedMemberIds.length} Members`}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MembersSection;
