import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import RefreshButton from "./RefreshButton";

const Navbar = ({ onLoginClick, user, onLogout }) => {
  return (
    <Box sx={{ flexGrow: 1 }} >
      <AppBar position="static" color="secondary" className="border-b shadow-xl" sx={{ backgroundColor: '#1e1e1e' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Daily Reviews
            </Link>
          </Typography>

          <RefreshButton />

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                {user.email}
              </Typography>
              {user.role === 'admin' && (
                <Button component={Link} to="/admin" color="inherit">
                  Admin
                </Button>
              )}
              <Button color="inherit" onClick={onLogout}>
                Logout
              </Button>
            </Box>
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
