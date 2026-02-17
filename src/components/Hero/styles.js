import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  // Hero wrapper: full-bleed background expected to be set inline on the element,
  // but we provide sensible defaults and sizing here.
  hero: {
    width: "100%",
    minHeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#000", // fallback while image loads
    backgroundSize: "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    [theme.breakpoints.down("md")]: {
      minHeight: 440,
    },
    [theme.breakpoints.down("sm")]: {
      minHeight: 340,
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
  },

  // Dark overlay improves contrast for text over bright photos
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
    background:
      "linear-gradient(180deg, rgba(6,12,8,0.48) 0%, rgba(6,12,8,0.18) 40%, rgba(6,12,8,0.06) 70%, rgba(6,12,8,0.00) 100%)",
  },

  // Inner container that holds copy and CTAs
  inner: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(8),
    display: "flex",
    justifyContent: "flex-start",
    // alignItems: "center",
  },

  // Content column (left-aligned)
  content: {
    maxWidth: 800,
    color: "#ffffff",
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.up("lg")]: {
      paddingLeft: theme.spacing(4),
    },
  },

  // Big, clean sans-serif headline — bold and eye-catching
  headline: {
    margin: 0,
    color: "#ffffff",
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
    fontWeight: 800,
    lineHeight: 1.03,
    letterSpacing: "-0.02em",
    fontSize: "3.6rem", // ~58px
    textShadow: "0 18px 48px rgba(0,0,0,0.5)",
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("lg")]: {
      fontSize: "3.0rem",
    },
    [theme.breakpoints.down("md")]: {
      fontSize: "2.2rem",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.6rem",
      textShadow: "0 8px 24px rgba(0,0,0,0.45)",
    },
  },

  // Short lead paragraph under the headline
  lead: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    color: "rgba(255,255,255,0.92)",
    fontSize: "1rem",
    fontWeight: 500,
    maxWidth: 640,
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.98rem",
    },
  },

  // CTA group (buttons)
  ctaGroup: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
    flexWrap: "wrap",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      flexDirection: "column",
      alignItems: "stretch",
    },
  },

  // Primary CTA: bold green pill
  primaryBtn: {
    background: "linear-gradient(180deg,#2f6b4f,#2b6f4f)",
    color: "#ffffff",
    padding: "12px 22px",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: "1rem",
    textTransform: "none",
    boxShadow: "0 12px 40px rgba(47,107,79,0.18)",
    transition: "transform 140ms ease, box-shadow 140ms ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 18px 48px rgba(47,107,79,0.22)",
    },
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
  },

  // Secondary CTA: light pill with subtle border
  secondaryBtn: {
    background: "#f2efe6",
    color: "#274b3f",
    padding: "11px 18px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: "0.98rem",
    textTransform: "none",
    border: "1px solid rgba(39,75,63,0.08)",
    transition: "background 120ms ease, transform 120ms ease",
    "&:hover": {
      background: "#efece1",
      transform: "translateY(-1px)",
    },
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
  },
}));

export default useStyles;
