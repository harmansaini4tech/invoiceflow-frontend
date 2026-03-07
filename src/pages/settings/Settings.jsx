import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import {
  User,
  Building2,
  Mail,
  Shield,
  Edit2,
  Save,
  X,
  Lock,
  Phone,
  FileText,
  Camera,
  Clock,
} from "lucide-react";

export default function Settings() {
  const { user, company, setCompany } = useAuth();

  // ── Section toggles ─────────────────────────────────────────────────────
  const [editingCompany, setEditingCompany] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  // ── Company form ─────────────────────────────────────────────────────────
  const [companyForm, setCompanyForm] = useState({
    name: company?.name || "",
    email: company?.email || "",
    phone: company?.phone || "",
    website: company?.website || "",
    taxNumber: company?.taxNumber || "",
    "invoiceSettings.prefix": company?.invoiceSettings?.prefix || "INV",
    "invoiceSettings.dueDays": company?.invoiceSettings?.dueDays || 15,
    "invoiceSettings.notes": company?.invoiceSettings?.notes || "",
    "invoiceSettings.terms": company?.invoiceSettings?.terms || "",
    "branding.template": company?.branding?.template || "modern",
    "branding.primaryColor": company?.branding?.primaryColor || "#DC2626",
    "branding.showLogo": company?.branding?.showLogo !== false,
    "branding.showBankDetails": company?.branding?.showBankDetails || false,
  });
  const [savingCompany, setSavingCompany] = useState(false);

  // ── Logo upload ──────────────────────────────────────────────────────────
  const [logoPreview, setLogoPreview] = useState(company?.logo?.url || null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef();

  // ── Password form ────────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCompanySave = async () => {
    if (!companyForm.name) return toast.error("Company name is required");
    setSavingCompany(true);
    try {
      const res = await api.put("/company", companyForm);
      if (setCompany) setCompany(res.data.data);
      toast.success("Company updated!");
      setEditingCompany(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSavingCompany(false);
    }
  };

  const handleCancelCompany = () => {
    setEditingCompany(false);
    setCompanyForm({
      name: company?.name || "",
      email: company?.email || "",
      phone: company?.phone || "",
      website: company?.website || "",
      taxNumber: company?.taxNumber || "",
      "invoiceSettings.prefix": company?.invoiceSettings?.prefix || "INV",
      "invoiceSettings.dueDays": company?.invoiceSettings?.dueDays || 15,
      "invoiceSettings.notes": company?.invoiceSettings?.notes || "",
      "invoiceSettings.terms": company?.invoiceSettings?.terms || "",
      // ✅ ADD THESE
      "branding.template": company?.branding?.template || "modern",
      "branding.primaryColor": company?.branding?.primaryColor || "#DC2626",
      "branding.showLogo": company?.branding?.showLogo !== false,
      "branding.showBankDetails": company?.branding?.showBankDetails || false,
    });
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Logo must be under 5MB");

    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);

    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await api.post("/company/logo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (setCompany) setCompany(res.data.data);
      toast.success("Logo uploaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logo upload failed");
      setLogoPreview(company?.logo?.url || null);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword)
      return toast.error("All fields are required");
    if (passwordForm.newPassword.length < 8)
      return toast.error("New password must be at least 8 characters");
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast.error("Passwords do not match");

    setSavingPassword(true);
    try {
      await api.patch("/users/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed!");
      setEditingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Reusable info row ─────────────────────────────────────────────────────
  const InfoRow = ({ icon: Icon, label, value, last }) => (
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-white ${
        !last ? "border-b border-gray-50" : ""
      }`}
    >
      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className="text-xs md:text-sm text-gray-500 flex-shrink-0">
          {label}
        </span>
        <span className="text-xs md:text-sm font-semibold text-gray-900 truncate text-right">
          {value || (
            <span className="text-gray-400 font-normal italic">Not set</span>
          )}
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl w-full space-y-4 md:space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          Manage your profile and company
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PROFILE CARD — read only
      ══════════════════════════════════════════════════════════════════ */}
      <div className="card p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 font-bold text-lg">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{user?.name}</h2>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full capitalize">
              <Shield className="w-3 h-3" /> {user?.role}
            </span>
          </div>
        </div>

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Profile Details
        </h3>
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <InfoRow icon={User} label="Name" value={user?.name} />
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={Shield} label="Role" value={user?.role} last />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          COMPANY CARD — editable
      ══════════════════════════════════════════════════════════════════ */}
      <div className="card p-4 md:p-6">
        {/* Card header with logo */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="logo"
                    className="w-12 h-12 object-cover rounded-2xl"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-70"
              >
                {uploadingLogo ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3 h-3 text-white" />
                )}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{company?.name}</h2>
              <p className="text-xs text-gray-400">
                {uploadingLogo ? "Uploading..." : "Click 📷 to change logo"}
              </p>
            </div>
          </div>

          {/* Edit / Cancel toggle */}
          <button
            onClick={
              editingCompany
                ? handleCancelCompany
                : () => setEditingCompany(true)
            }
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              editingCompany
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            {editingCompany ? (
              <>
                <X className="w-3.5 h-3.5" /> Cancel
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </>
            )}
          </button>
        </div>

        {/* ── View mode ──────────────────────────────────────────────── */}
        {!editingCompany && (
          <>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Company Details
            </h3>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <InfoRow icon={Building2} label="Name" value={company?.name} />
              <InfoRow icon={Mail} label="Email" value={company?.email} />
              <InfoRow icon={Phone} label="Phone" value={company?.phone} />
              <InfoRow
                icon={Building2}
                label="Website"
                value={company?.website}
              />
              <InfoRow
                icon={FileText}
                label="Tax Number"
                value={company?.taxNumber}
              />
              <InfoRow
                icon={FileText}
                label="Invoice Prefix"
                value={`${company?.invoiceSettings?.prefix || "INV"}-0001`}
              />
              <InfoRow
                icon={Clock}
                label="Due Days"
                value={
                  company?.invoiceSettings?.dueDays
                    ? `${company.invoiceSettings.dueDays} days`
                    : "15 days"
                }
              />

              {/* ✅ ADD THESE */}
              <InfoRow
                icon={FileText}
                label="PDF Template"
                value={
                  company?.branding?.template
                    ? company.branding.template.charAt(0).toUpperCase() +
                      company.branding.template.slice(1)
                    : "Modern"
                }
              />
              <InfoRow
                icon={Building2}
                label="Brand Color"
                value={
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{
                        backgroundColor:
                          company?.branding?.primaryColor || "#DC2626",
                      }}
                    />
                    <span>{company?.branding?.primaryColor || "#DC2626"}</span>
                  </div>
                }
                last
              />
            </div>
          </>
        )}

        {/* ── Edit mode ──────────────────────────────────────────────── */}
        {editingCompany && (
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Edit Company Details
            </h3>

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Company Name *"
                value={companyForm.name}
                onChange={(e) =>
                  setCompanyForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Acme Inc."
              />
              <Input
                label="Company Email"
                type="email"
                value={companyForm.email}
                onChange={(e) =>
                  setCompanyForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="hello@acme.com"
              />
            </div>

            {/* Phone + Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Phone"
                value={companyForm.phone}
                onChange={(e) =>
                  setCompanyForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+91 98765 43210"
              />
              <Input
                label="Website"
                value={companyForm.website}
                onChange={(e) =>
                  setCompanyForm((p) => ({ ...p, website: e.target.value }))
                }
                placeholder="https://yourcompany.com"
              />
            </div>

            {/* Invoice Prefix + Due Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Prefix
                </label>
                <div className="flex items-center gap-2">
                  <input
                    value={companyForm["invoiceSettings.prefix"]}
                    onChange={(e) =>
                      setCompanyForm((p) => ({
                        ...p,
                        "invoiceSettings.prefix": e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 6),
                      }))
                    }
                    className="input-field flex-1 font-mono uppercase"
                    placeholder="INV"
                    maxLength={6}
                  />
                  <span className="text-xs text-gray-400 font-mono flex-shrink-0">
                    -{companyForm["invoiceSettings.prefix"] || "INV"}-0001
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Max 6 chars</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Due Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={companyForm["invoiceSettings.dueDays"]}
                  onChange={(e) =>
                    setCompanyForm((p) => ({
                      ...p,
                      "invoiceSettings.dueDays": e.target.value,
                    }))
                  }
                  className="input-field"
                  placeholder="15"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Days until invoice due
                </p>
              </div>
            </div>

            {/* Tax Number */}
            <Input
              label="Tax Number / GST / VAT"
              value={companyForm.taxNumber}
              onChange={(e) =>
                setCompanyForm((p) => ({ ...p, taxNumber: e.target.value }))
              }
              placeholder="GST123456789"
            />

            {/* Template Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Template
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: "modern",
                    label: "Modern",
                    desc: "Bold red header",
                    emoji: "🔴",
                  },
                  {
                    id: "classic",
                    label: "Classic",
                    desc: "Left sidebar layout",
                    emoji: "🔵",
                  },
                  {
                    id: "minimal",
                    label: "Minimal",
                    desc: "Clean & minimal",
                    emoji: "⚪",
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setCompanyForm((p) => ({
                        ...p,
                        "branding.template": t.id,
                      }))
                    }
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      companyForm["branding.template"] === t.id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-xl mb-1">{t.emoji}</div>
                    <p className="text-xs font-bold text-gray-900">{t.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={companyForm["branding.primaryColor"] || "#DC2626"}
                  onChange={(e) =>
                    setCompanyForm((p) => ({
                      ...p,
                      "branding.primaryColor": e.target.value,
                    }))
                  }
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <div className="flex gap-2">
                  {[
                    "#DC2626",
                    "#1E3A5F",
                    "#059669",
                    "#7C3AED",
                    "#D97706",
                    "#111827",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setCompanyForm((p) => ({
                          ...p,
                          "branding.primaryColor": color,
                        }))
                      }
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        companyForm["branding.primaryColor"] === color
                          ? "border-gray-900 scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {companyForm["branding.primaryColor"] || "#DC2626"}
                </span>
              </div>
            </div>

            {/* Show/Hide toggles */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={companyForm["branding.showLogo"] !== false}
                  onChange={(e) =>
                    setCompanyForm((p) => ({
                      ...p,
                      "branding.showLogo": e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-red-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Show Logo</p>
                  <p className="text-xs text-gray-500">Display on PDF</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={companyForm["branding.showBankDetails"] === true}
                  onChange={(e) =>
                    setCompanyForm((p) => ({
                      ...p,
                      "branding.showBankDetails": e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-red-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Bank Details
                  </p>
                  <p className="text-xs text-gray-500">Show on PDF</p>
                </div>
              </label>
            </div>

            {/* Bank Details — only show if showBankDetails is enabled */}
            {companyForm["branding.showBankDetails"] && (
              <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                  🏦 Bank Details
                  <span className="text-xs font-normal text-blue-500">
                    Shown on PDF invoices
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Bank Name"
                    value={companyForm["bankDetails.bankName"]}
                    onChange={(e) =>
                      setCompanyForm((p) => ({
                        ...p,
                        "bankDetails.bankName": e.target.value,
                      }))
                    }
                    placeholder="State Bank of India"
                  />
                  <Input
                    label="Account Name"
                    value={companyForm["bankDetails.accountName"]}
                    onChange={(e) =>
                      setCompanyForm((p) => ({
                        ...p,
                        "bankDetails.accountName": e.target.value,
                      }))
                    }
                    placeholder="Acme Inc."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Account Number"
                    value={companyForm["bankDetails.accountNumber"]}
                    onChange={(e) =>
                      setCompanyForm((p) => ({
                        ...p,
                        "bankDetails.accountNumber": e.target.value,
                      }))
                    }
                    placeholder="1234567890"
                  />
                  <Input
                    label="IFSC / SWIFT Code"
                    value={companyForm["bankDetails.ifscSwift"]}
                    onChange={(e) =>
                      setCompanyForm((p) => ({
                        ...p,
                        "bankDetails.ifscSwift": e.target.value,
                      }))
                    }
                    placeholder="SBIN0001234"
                  />
                </div>

                <Input
                  label="UPI ID"
                  value={companyForm["bankDetails.upiId"]}
                  onChange={(e) =>
                    setCompanyForm((p) => ({
                      ...p,
                      "bankDetails.upiId": e.target.value,
                    }))
                  }
                  placeholder="yourname@upi"
                />
              </div>
            )}

            {company?.bankDetails?.bankName && (
              <InfoRow
                icon={Building2}
                label="Bank"
                value={company.bankDetails.bankName}
              />
            )}
            {company?.bankDetails?.accountNumber && (
              <InfoRow
                icon={FileText}
                label="Account No."
                value={company.bankDetails.accountNumber}
              />
            )}
            {company?.bankDetails?.upiId && (
              <InfoRow
                icon={FileText}
                label="UPI ID"
                value={company.bankDetails.upiId}
                last
              />
            )}

            {/* Default Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Invoice Notes
              </label>
              <textarea
                rows={2}
                value={companyForm["invoiceSettings.notes"]}
                onChange={(e) =>
                  setCompanyForm((p) => ({
                    ...p,
                    "invoiceSettings.notes": e.target.value,
                  }))
                }
                className="input-field resize-none w-full"
                placeholder="Thank you for your business!"
              />
            </div>

            {/* Default Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Payment Terms
              </label>
              <textarea
                rows={2}
                value={companyForm["invoiceSettings.terms"]}
                onChange={(e) =>
                  setCompanyForm((p) => ({
                    ...p,
                    "invoiceSettings.terms": e.target.value,
                  }))
                }
                className="input-field resize-none w-full"
                placeholder="Payment due within 15 days..."
              />
            </div>

            {/* Save / Cancel */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
              <Button
                onClick={handleCompanySave}
                loading={savingCompany}
                className="w-full sm:w-auto justify-center"
              >
                <Save className="w-4 h-4" /> Save Changes
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancelCompany}
                className="w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          CHANGE PASSWORD CARD
      ══════════════════════════════════════════════════════════════════ */}
      <div className="card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Password</h2>
              <p className="text-xs text-gray-400">
                Change your login password
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingPassword(!editingPassword);
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            }}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              editingPassword
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-orange-50 text-orange-600 hover:bg-orange-100"
            }`}
          >
            {editingPassword ? (
              <>
                <X className="w-3.5 h-3.5" /> Cancel
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" /> Change
              </>
            )}
          </button>
        </div>

        {/* View mode — dots */}
        {!editingPassword && (
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-gray-300 rounded-full" />
              ))}
            </div>
            <span className="text-xs text-gray-400">Password is set</span>
          </div>
        )}

        {/* Edit mode */}
        {editingPassword && (
          <div className="space-y-3">
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({
                  ...p,
                  currentPassword: e.target.value,
                }))
              }
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
              }
              placeholder="Min. 8 characters"
            />

            {/* Strength meter */}
            {passwordForm.newPassword.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        passwordForm.newPassword.length >= i * 2
                          ? passwordForm.newPassword.length >= 8
                            ? "bg-green-500"
                            : "bg-yellow-400"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`text-xs font-medium ${
                    passwordForm.newPassword.length >= 8
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {passwordForm.newPassword.length >= 8
                    ? "Strong"
                    : "Too short"}
                </span>
              </div>
            )}

            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({
                  ...p,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Re-enter new password"
            />

            {/* Match indicator */}
            {passwordForm.confirmPassword.length > 0 && (
              <p
                className={`text-xs font-medium ${
                  passwordForm.newPassword === passwordForm.confirmPassword
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {passwordForm.newPassword === passwordForm.confirmPassword
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
              <Button
                onClick={handlePasswordSave}
                loading={savingPassword}
                className="w-full sm:w-auto justify-center"
              >
                <Save className="w-4 h-4" /> Update Password
              </Button>
              <Button
                variant="secondary"
                onClick={() => setEditingPassword(false)}
                className="w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
