import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference States
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const savePreferences = (prefs: { analytics: boolean; marketing: boolean }) => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({ necessary: true, ...prefs })
    );
    setVisible(false);
    setShowPreferences(false);
  };

  const acceptAll = () => {
    savePreferences({ analytics: true, marketing: true });
  };

  const declineAll = () => {
    savePreferences({ analytics: false, marketing: false });
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg animate-in slide-in-from-bottom-5 duration-300">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <h3 className="text-base font-semibold mb-1">Your Privacy</h3>
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your experience, serve personalized content, and analyze our traffic. 
              By clicking "Accept All", you consent to our use of cookies in accordance with our{" "}
              <Link to="/cookie-policy" className="text-primary underline hover:text-primary/80">
                Cookie Policy
              </Link>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => setShowPreferences(true)} className="w-full sm:w-auto">
              Manage Preferences
            </Button>
            <Button variant="secondary" size="sm" onClick={declineAll} className="w-full sm:w-auto">
              Reject Optional
            </Button>
            <Button size="sm" onClick={acceptAll} className="w-full sm:w-auto">
              Accept All
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Manage your cookie settings below. You can change these at any time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label>Strictly Necessary</Label>
                <span className="text-xs text-muted-foreground">Required for the website to function properly. Cannot be disabled.</span>
              </div>
              <Switch checked={true} disabled />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label>Analytics</Label>
                <span className="text-xs text-muted-foreground">Helps us understand how visitors interact with the platform.</span>
              </div>
              <Switch checked={analytics} onCheckedChange={setAnalytics} />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label>Marketing & Advertising</Label>
                <span className="text-xs text-muted-foreground">Used to deliver personalized advertisements.</span>
              </div>
              <Switch checked={marketing} onCheckedChange={setMarketing} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => savePreferences({ analytics: false, marketing: false })}>
              Reject Optional
            </Button>
            <Button onClick={() => savePreferences({ analytics, marketing })}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
