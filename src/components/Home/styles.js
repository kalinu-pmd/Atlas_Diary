import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => {
  const ACCENT_BG = "#FBF7F2"; // light cream used across homepage
  const CARD_BG = "#ffffff";
  const MUTED = "#55605a";

  return {
    // Root wrapper used in Home.jsx
    root: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: ACCENT_BG,
      color: MUTED,
    },

    // Generic main area (flex grow)
    main: {
      flex: 1,
      width: "100%",
      display: "block",
    },

    // Wrapping container for Posts to give consistent vertical spacing
    postsWrap: {
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(10),
      // keep content comfortably centered on large screens
      [theme.breakpoints.up("lg")]: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
      },
      [theme.breakpoints.down("sm")]: {
        paddingTop: theme.spacing(6),
        paddingBottom: theme.spacing(6),
      },
    },

    // Small helper to visually separate hero from main content when hero is full-bleed
    heroSpacer: {
      height: 24,
      [theme.breakpoints.down("sm")]: {
        height: 18,
      },
    },

    // Centered container variant used inside Home for marketing layouts
    centeredContainer: {
      maxWidth: 1100,
      marginLeft: "auto",
      marginRight: "auto",
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      width: "100%",
    },

    // Legacy search card style (kept for compatibility)
    appBarSearch: {
      borderRadius: 12,
      marginBottom: "1rem",
      display: "flex",
      padding: "16px",
      backgroundColor: CARD_BG,
      border: "2px solid rgba(12,52,44,0.08)",
      boxShadow: "0 6px 20px rgba(6,12,8,0.06)",
    },

    // Legacy pagination wrapper style
    pagination: {
      borderRadius: 12,
      marginTop: "1rem",
      padding: "16px",
      backgroundColor: CARD_BG,
      border: "1px solid rgba(47,107,79,0.06)",
      boxShadow: "0 6px 18px rgba(6,12,8,0.04)",
    },

    // Legacy grid container class (kept for Posts/Grid compatibility)
    gridContainer: {
      backgroundColor: "transparent",
      [theme.breakpoints.down("xs")]: {
        flexDirection: "column-reverse",
      },
    },

    // Top offset helper to prevent sticky navbar overlap. Use inline style where necessary.
    topOffset: {
      // Typical sticky navbar heights:
      // desktop ~80px, mobile ~64px. Consumers can override with theme breakpoints.
      marginTop: 80,
      [theme.breakpoints.down("sm")]: {
        marginTop: 64,
      },
    },

    // Small utility classes used by child components for consistent card styling
    card: {
      background: CARD_BG,
      borderRadius: 12,
      // padding: theme.spacing(3),
      boxShadow: "0 8px 28px rgba(6,12,8,0.06)",
    },

    // Utility for horizontally centering a slice
    centerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    // Footer spacing helper in case other components need to offset
    footerSpacer: {
      paddingTop: theme.spacing(6),
    },

    // Small typography helpers
    headingAccent: {
      color: "#1e4336",
      fontWeight: 700,
    },
    mutedText: {
      color: MUTED,
    },

    // Responsive tweaks
    "@media (max-width:900px)": {
      postsWrap: {
        paddingTop: theme.spacing(6),
        paddingBottom: theme.spacing(6),
      },
      centeredContainer: {
        paddingLeft: theme.spacing(1.5),
        paddingRight: theme.spacing(1.5),
      },
    },

    "@media (max-width:480px)": {
      postsWrap: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(5),
      },
      card: {
        padding: theme.spacing(2),
      },
    },
  };
});
