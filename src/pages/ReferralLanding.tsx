import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Lightweight cookie helpers
function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

const ReferralLanding = () => {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    if (!code) {
      navigate("/", { replace: true });
      return;
    }

    const logClickAndRedirect = async () => {
      try {
        setCookie("ref_code", code, 30);

        // Resolve code ensures it exists, then log click (unauth ok due to RLS)
        const { data: codeRow } = await supabase
          .from("referral_codes")
          .select("code")
          .eq("code", code)
          .maybeSingle();

        if (codeRow) {
          await supabase.from("referral_clicks").insert({ code, user_agent: navigator.userAgent });
        }
      } catch {
        // ignore failures silently
      } finally {
        navigate("/auth", { replace: true });
      }
    };

    logClickAndRedirect();
  }, [code, navigate]);

  return null;
};

export default ReferralLanding;
