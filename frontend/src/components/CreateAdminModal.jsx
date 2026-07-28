import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FieldError, FormErrorSummary } from "@/components/admin/forms/AdminFormLayout";
import AdminConfirmDialog from "@/components/admin/forms/AdminConfirmDialog";
import { 
  UserPlus, 
  Crown, 
  Mail, 
  Eye,
  EyeOff,
  Key, 
  User, 
  Shield,
  AlertCircle,
  Lock
} from 'lucide-react';
import { validateEmail, validateNewPassword } from '../utils/auth';

const CreateAdminModal = ({
  isOpen,
  onClose,
  onCreateAdmin,
  currentUser,
  canCreateAdmin,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmSuperAdminOpen, setConfirmSuperAdminOpen] = useState(false);
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const roleTriggerRef = useRef(null);
  const submitErrorRef = useRef(null);

  useEffect(() => {
    if (typeof canCreateAdmin === "boolean") {
      setIsSuperAdmin(canCreateAdmin);
      return;
    }

    if (currentUser) {
      const userIsSuperAdmin = currentUser.role === 'superadmin' || 
                              currentUser.role === 'super-admin' ||
                              currentUser.isSuperAdmin === true;
      setIsSuperAdmin(userIsSuperAdmin);
    }
  }, [canCreateAdmin, currentUser]);

  useEffect(() => {
    if (errors.submit) {
      submitErrorRef.current?.focus();
    }
  }, [errors.submit]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }
    
    const passwordError = validateNewPassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    setErrors(newErrors);

    const firstInvalidField = Object.keys(newErrors)[0];
    if (firstInvalidField) {
      focusField(firstInvalidField);
    }

    return Object.keys(newErrors).length === 0;
  };

  const focusField = (fieldName) => {
    const fieldRefs = {
      name: nameInputRef,
      email: emailInputRef,
      password: passwordInputRef,
      role: roleTriggerRef,
    };
    requestAnimationFrame(() => fieldRefs[fieldName]?.current?.focus());
  };

  const createAdministrator = async () => {
    setLoading(true);
    try {
      await onCreateAdmin({
        ...formData,
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim(),
      });
      handleClose();
    } catch (error) {
      const fieldErrors = error?.response?.data?.errors || {};
      const normalizedFieldErrors = Object.fromEntries(
        Object.entries(fieldErrors).map(([field, value]) => [
          field,
          Array.isArray(value) ? value[0] : value,
        ])
      );
      const nextErrors = {
        ...normalizedFieldErrors,
        submit: error?.response?.data?.message || error.message || "Failed to create administrator.",
      };
      setErrors(nextErrors);
      const firstFieldError = Object.keys(normalizedFieldErrors)[0];
      if (firstFieldError) {
        focusField(firstFieldError);
      }
    } finally {
      setLoading(false);
      setConfirmSuperAdminOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (formData.role === "superadmin") {
      setConfirmSuperAdminOpen(true);
      return;
    }

    await createAdministrator();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        submit: ''
      }));
    }
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: '',
        submit: ''
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin'
    });
    setErrors({});
    setShowPassword(false);
    setConfirmSuperAdminOpen(false);
    onClose();
  };

  // If user is not superadmin, show restricted access view
  if (!isSuperAdmin) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Lock className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <DialogTitle className="text-xl text-destructive">
              Access Denied
            </DialogTitle>
            <DialogDescription className="text-center">
              You don't have permission to create new administrators.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Only Super Administrators can create new admin accounts.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium text-sm">Super Admin Required</p>
                  <p className="text-xs text-muted-foreground">
                    Contact a super administrator to create new admin accounts
                  </p>
                </div>
              </div>
              
              {currentUser && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your Role:</span>
                  <Badge variant="outline" className="capitalize">
                    {currentUser.role || 'admin'}
                  </Badge>
                </div>
              )}
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Create Administrator
          </DialogTitle>
          <DialogDescription>
            Add a new administrator to your team with the appropriate dashboard role.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          <Badge variant="outline" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Super Admin Mode
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <FormErrorSummary ref={submitErrorRef} title="Administrator was not created">
              {errors.submit}
            </FormErrorSummary>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full name
            </Label>
            <Input
              ref={nameInputRef}
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "admin-name-error" : undefined}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <FieldError id="admin-name-error" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.name}
              </FieldError>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email address
            </Label>
            <Input
              ref={emailInputRef}
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "admin-email-error" : undefined}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <FieldError id="admin-email-error" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.email}
              </FieldError>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              Temporary password
            </Label>
            <div className="relative">
              <Input
                ref={passwordInputRef}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "admin-password-error admin-password-help" : "admin-password-help"}
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            {errors.password && (
              <FieldError id="admin-password-error" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.password}
              </FieldError>
            )}
            <p id="admin-password-help" className="text-xs text-muted-foreground">
              Password must contain at least 12 characters and be no more than 72 UTF-8 bytes.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Role
            </Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger
                ref={roleTriggerRef}
                id="role"
                aria-invalid={Boolean(errors.role)}
                aria-describedby={errors.role ? "admin-role-error admin-role-help" : "admin-role-help"}
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Administrator
                  </div>
                </SelectItem>
                <SelectItem value="superadmin">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Super Administrator
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <FieldError id="admin-role-error" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.role}
              </FieldError>
            )}
            <p id="admin-role-help" className="text-xs text-muted-foreground">
              Super administrators have full system access.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2" aria-live="polite">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Admin
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    <AdminConfirmDialog
      open={confirmSuperAdminOpen}
      onOpenChange={(open) => {
        if (!open && !loading) setConfirmSuperAdminOpen(false);
      }}
      title="Create a Super Administrator?"
      description="This account will have full system access. Confirm that this person should be able to manage administrators and protected dashboard operations."
      confirmLabel="Create Super Admin"
      onConfirm={createAdministrator}
      loading={loading}
      destructive
    />
    </>
  );
};

export default CreateAdminModal;
