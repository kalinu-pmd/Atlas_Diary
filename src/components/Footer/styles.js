import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  /* CTA strip above the footer: light green gradient with centered CTA */
  ctaStrip: {
    background: "linear-gradient(180deg, #e9f3ea 0%, #e1efe5 100%)",
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(6),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    [theme.breakpoints.down("sm")]: {
      paddingTop: theme.spacing(5),
      paddingBottom: theme.spacing(4),
    },
  },

  ctaContainer: {
    width: "100%",
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "center",
      gap: theme.spacing(1.5),
    },
  },

  ctaTitle: {
    color: "#163a31",
    fontWeight: 700,
    letterSpacing: 0.2,
    fontSize: "1.125rem",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1rem",
    },
  },

  ctaButton: {
    background: "linear-gradient(180deg,#2f6b4f,#2b6f4f)",
    color: "#ffffff",
    textTransform: "none",
    borderRadius: 8,
    padding: "10px 22px",
    boxShadow: "0 12px 36px rgba(47,107,79,0.12)",
    fontWeight: 700,
    transition: "transform 160ms ease, box-shadow 160ms ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 18px 44px rgba(47,107,79,0.18)",
    },
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
  },

  /* Footer bar: dark green background with muted links and copyright */
  footer: {
    background: "linear-gradient(180deg,#152f27 0%, #0c342c 100%)",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    color: "#f2f5f1",
  },

  footerInner: {
    width: "100%",
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      textAlign: "center",
      gap: theme.spacing(1.5),
    },
  },

  footerLinks: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    color: "rgba(255,255,255,0.9)",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  footerLink: {
    color: "rgba(255,255,255,0.9)",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
    padding: theme.spacing(0.5),
    "&:hover": {
      color: "#ffffff",
      textDecoration: "underline",
    },
  },

  footerDivider: {
    color: "rgba(255,255,255,0.6)",
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    userSelect: "none",
  },

  copyright: {
    color: "rgba(255,255,255,0.78)",
    fontSize: "0.85rem",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(0.5),
    },
  },

  /* small helper to control CTA layout when used elsewhere */
  centeredCtaWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      width: "100%",
    },
  },
}));
