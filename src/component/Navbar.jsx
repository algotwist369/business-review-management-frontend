import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import RefreshButton from "./RefreshButton";

const Navbar = ({ onLoginClick, onPasswordClick, user, onLogout }) => {
  const canUseAiReviews = user?.role === 'super_admin' || user?.ai_review_access
  const [menuAnchor, setMenuAnchor] = useState(null)
  const closeMenu = () => setMenuAnchor(null)

  return (
    <Box sx={{ flexGrow: 1 }} >
      <AppBar
        position="static"
        color="secondary"
        className="border-b shadow-xl"
        sx={{
          backgroundColor: '#1e1e1e',
          borderColor: '#292929',
          position: { xs: 'static', md: 'fixed' },
          top: { md: 0 },
          left: { md: 0 },
          right: { md: 0 },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: { xs: 60, md: 64 } }}>
          <Typography variant="h6" sx={{ flexGrow: 1, minWidth: 0, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Daily Reviews
            </Link>
          </Typography>

          <RefreshButton />

          {user ? (
            <>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                {user.email}
              </Typography>
              {['admin', 'super_admin'].includes(user.role) && (
                <Button component={Link} to="/admin" color="inherit">
                  Admin
                </Button>
              )}
              {canUseAiReviews && (
                <Button component={Link} to="/ai-reviews" color="inherit">
                  AI Reviews
                </Button>
              )}
              <Button color="inherit" onClick={onPasswordClick}>
                Password
              </Button>
              <Button color="inherit" onClick={onLogout}>
                Logout
              </Button>
            </Box>
            <IconButton
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#fff' }}
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={!!menuAnchor}
              onClose={closeMenu}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 220,
                  bgcolor: '#121212',
                  color: '#fff',
                  border: '1px solid #333',
                },
              }}
            >
              <MenuItem disabled sx={{ color: '#aaa !important', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                {user.email}
              </MenuItem>
              {['admin', 'super_admin'].includes(user.role) && (
                <MenuItem component={Link} to="/admin" onClick={closeMenu}>Admin</MenuItem>
              )}
              {canUseAiReviews && (
                <MenuItem component={Link} to="/ai-reviews" onClick={closeMenu}>AI Reviews</MenuItem>
              )}
              <MenuItem onClick={() => { closeMenu(); onPasswordClick() }}>Password</MenuItem>
              <MenuItem onClick={() => { closeMenu(); onLogout() }}>Logout</MenuItem>
            </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={onLoginClick}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
