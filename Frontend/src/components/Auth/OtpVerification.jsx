import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";
import { toast } from "react-toastify";
import { verifyOtp } from "../../actions/auth";

const OtpVerification = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const emailFromQuery = params.get("email") || "";

  const [email] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");

  // TEMPORARY: if backend returns a debugOtp (because SMTP
  // is blocked), the signup flow stores it in localStorage.
  // Here we auto-fill the OTP field for the matching email.
  // Safe to remove this block once real email delivery works.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("debug-signup-otp");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.email || !parsed?.otp) return;

      // Ensure the stored OTP is for this email
      if (parsed.email !== emailFromQuery) return;

      // Respect the same 10 minute expiry window as backend
      if (
        typeof parsed.createdAt === "number" &&
        Date.now() - parsed.createdAt > 10 * 60 * 1000
      ) {
        return;
      }

      setOtp(String(parsed.otp));
    } catch {
      // ignore parse errors
    }
  }, [emailFromQuery]);

  useEffect(() => {
    if (!emailFromQuery) {
      toast.error("Missing email. Please sign up again.");
      history.push("/signup");
    }
  }, [emailFromQuery, history]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error("Please enter the verification code.");
      return;
    }

    if (otp.length < 4 || otp.length > 8) {
      toast.error("Please enter a valid verification code.");
      return;
    }

    dispatch(verifyOtp({ email, otp }, history));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white px-4 py-12">
      <div className="w-full max-w-sm bg-off-white border border-dark-green rounded-[15px] shadow-form p-6 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-dark-green flex items-center justify-center mb-3">
          <MdLockOutline size={24} className="text-off-white" />
        </div>

        <h2 className="text-2xl font-bold text-text-dark mb-1">
          Verify your email
        </h2>
        <p className="text-xs text-text-gray mb-4 text-center">
          We sent a 6-digit verification code to
          {" "}
          <span className="font-semibold text-dark-green">{email || "your email"}</span>.
          {" "}
          Enter it below to activate your account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-3"
          noValidate
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-green">
              Email
            </label>
            <div className="w-full bg-off-white border border-dark-green rounded-lg px-3 py-2 text-sm text-text-dark">
              {email}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-green">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              maxLength={8}
              className="w-full tracking-[0.4em] text-center bg-off-white border border-dark-green hover:border-light-green focus:border-dark-green focus:outline-none rounded-lg px-3 py-2 text-sm text-text-dark transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-light-green hover:bg-light-green-hover text-text-dark font-bold py-2.5 rounded-md transition-colors"
          >
            Verify and continue
          </button>

          <button
            type="button"
            onClick={() => history.push("/signup")}
            className="w-full text-sm text-dark-green font-semibold py-2 hover:underline transition-colors"
          >
            Go back and edit details
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
