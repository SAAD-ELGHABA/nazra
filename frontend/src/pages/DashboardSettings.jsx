import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Settings } from "lucide-react";
import { getAdminSettings, updateAdminSettings } from "@/api/api";
import { DASHBOARDHOME, DASHBOARDSETTINGS } from "@/constant/routerConstants";
import { useAdminPageMeta } from "@/context/AdminPageContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageContainer from "@/components/admin/page/AdminPageContainer";
import AdminPageHeader from "@/components/admin/page/AdminPageHeader";
import AdminLoadingState from "@/components/admin/feedback/AdminLoadingState";
import AdminErrorState from "@/components/admin/feedback/AdminErrorState";
import { FormSection, FormSectionHeader, FormActions, FieldError } from "@/components/admin/forms/AdminFormLayout";

const DEFAULT_STORE = {
  timezone: "Africa/Casablanca",
  currency: "MAD",
  lowStockThreshold: 5,
  contactRecipients: [],
  publicContactEmail: "",
  publicPhone: "",
  whatsappNumber: "",
};

export default function DashboardSettings() {
  const [store, setStore] = useState(DEFAULT_STORE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { hasCapability } = useAdminAuth();
  const canManageSettings = hasCapability("settings.manage");

  useAdminPageMeta({
    title: "Settings",
    breadcrumbs: [
      { label: "Overview", href: DASHBOARDHOME },
      { label: "Settings", href: DASHBOARDSETTINGS },
    ],
  });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminSettings();
      setStore({ ...DEFAULT_STORE, ...(response?.data?.data?.store || {}) });
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Settings could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateField = (key, value) => {
    setStore((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: "" }));
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    if (!canManageSettings) {
      toast.error("Settings are read-only for your account.");
      return;
    }
    setSaving(true);
    setFieldErrors({});
    try {
      const payload = {
        store: {
          ...store,
          lowStockThreshold: Number(store.lowStockThreshold),
          contactRecipients: String(store.contactRecipientsText || "")
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean),
        },
      };
      delete payload.store.contactRecipientsText;
      const response = await updateAdminSettings(payload);
      setStore({ ...DEFAULT_STORE, ...(response?.data?.data?.store || {}) });
      toast.success("Settings saved");
    } catch (saveError) {
      setFieldErrors(saveError?.response?.data?.errors || {});
      toast.error("Settings could not be saved", {
        description: saveError?.response?.data?.message || "Please review the form and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPageContainer>
        <AdminPageHeader title="Settings" description="Configure operational dashboard defaults." />
        <AdminLoadingState title="Loading settings" variant="cards" rows={3} />
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Settings"
        description="Configure store-level defaults that the admin dashboard can enforce."
      />

      {error ? (
        <AdminErrorState title="We couldn't load settings" description={error} onRetry={loadSettings} />
      ) : (
        <form onSubmit={saveSettings} className="space-y-6">
          {!canManageSettings && (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              Your account can view settings, but only admins with settings management permission can edit them.
            </div>
          )}
          <FormSection>
            <FormSectionHeader
              title="Store Operations"
              description="These values support dashboard formatting, stock alerts, and public contact workflows."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" value={store.timezone} onChange={(event) => updateField("timezone", event.target.value)} disabled={!canManageSettings} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" value={store.currency} onChange={(event) => updateField("currency", event.target.value)} disabled={!canManageSettings} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low-stock threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  max="1000"
                  value={store.lowStockThreshold}
                  onChange={(event) => updateField("lowStockThreshold", event.target.value)}
                  disabled={!canManageSettings}
                  aria-invalid={Boolean(fieldErrors.lowStockThreshold)}
                  aria-describedby={fieldErrors.lowStockThreshold ? "low-stock-error" : undefined}
                />
                <FieldError id="low-stock-error">{fieldErrors.lowStockThreshold}</FieldError>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactRecipients">Contact recipients</Label>
                <Input
                  id="contactRecipients"
                  value={store.contactRecipientsText ?? (store.contactRecipients || []).join(", ")}
                  onChange={(event) => updateField("contactRecipientsText", event.target.value)}
                  placeholder="support@example.com, ops@example.com"
                  disabled={!canManageSettings}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicContactEmail">Public contact email</Label>
                <Input id="publicContactEmail" type="email" value={store.publicContactEmail} onChange={(event) => updateField("publicContactEmail", event.target.value)} disabled={!canManageSettings} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicPhone">Public phone</Label>
                <Input id="publicPhone" value={store.publicPhone} onChange={(event) => updateField("publicPhone", event.target.value)} disabled={!canManageSettings} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp number</Label>
                <Input id="whatsappNumber" value={store.whatsappNumber} onChange={(event) => updateField("whatsappNumber", event.target.value)} disabled={!canManageSettings} />
              </div>
            </div>
            <FormActions>
              <Button type="submit" disabled={saving || !canManageSettings}>
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save aria-hidden="true" />
                    Save settings
                  </>
                )}
              </Button>
            </FormActions>
          </FormSection>

          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Settings className="mt-0.5 h-4 w-4" aria-hidden="true" />
              <p>
                Infrastructure secrets and private API keys should stay in environment variables, not in dashboard settings.
              </p>
            </div>
          </div>
        </form>
      )}
    </AdminPageContainer>
  );
}
