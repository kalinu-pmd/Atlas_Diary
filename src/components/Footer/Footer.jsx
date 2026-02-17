import React from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import useStyles from "./styles";

/**
 * Footer component matching the homepage mockup:
 * - CTA strip with centered headline and primary green button
 * - Footer bar with small muted links and copyright text centered
 *
 * Note: styles are expected to be defined in ./styles.js and should provide:
 *  - ctaStrip, ctaContainer, ctaTitle, ctaButton
 *  - footer, footerInner, footerLinks, footerLink, footerDivider, copyright
 */
export default function Footer() {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box component="footer" aria-label="Site footer">
      {/* CTA strip above the footer (large green area with CTA) */}
      <Box
        className={classes.ctaStrip}
        role="region"
        aria-labelledby="create-your-atlas"
      >
        <Container maxWidth="lg" className={classes.ctaContainer}>
          <Box>
            <Typography
              id="create-your-atlas"
              className={classes.ctaTitle}
              variant={isMobile ? "h6" : "h5"}
            >
              Your memories deserve more than temporary posts.
            </Typography>
          </Box>

          <Box>
            <Button
              component={RouterLink}
              to="/signup"
              className={classes.ctaButton}
              aria-label="Create Your Atlas"
              size={isMobile ? "medium" : "large"}
            >
              Create Your Atlas
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer bar */}
      <Box className={classes.footer} role="contentinfo">
        <Container maxWidth="lg" className={classes.footerInner}>
          <Box
            className={classes.footerLinks}
            component="nav"
            aria-label="Footer"
          >
            <Button
              component={RouterLink}
              to="/about"
              className={classes.footerLink}
              size="small"
            >
              About
            </Button>

            <Box component="span" className={classes.footerDivider} aria-hidden>
              |
            </Box>

            <Button
              component={RouterLink}
              to="/contact"
              className={classes.footerLink}
              size="small"
            >
              Contact
            </Button>

            <Box component="span" className={classes.footerDivider} aria-hidden>
              |
            </Box>

            <Button
              component={RouterLink}
              to="/privacy"
              className={classes.footerLink}
              size="small"
            >
              Privacy Policy
            </Button>
          </Box>

          <Typography variant="caption" className={classes.copyright}>
            © {new Date().getFullYear()} Atlas Diary. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
