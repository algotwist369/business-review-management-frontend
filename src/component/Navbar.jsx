import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import RefreshButton from "./RefreshButton";
import { usePaymentSetting, useUpdatePaymentSetting } from "../hooks/useReviews";

const Navbar = ({ onLoginClick, onPasswordClick, user, onLogout }) => {
  const canUseAiReviews = user?.role === 'super_admin' || user?.ai_review_access
  const canManagePaymentPrice = ['admin', 'super_admin'].includes(user?.role)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [priceDialogOpen, setPriceDialogOpen] = useState(false)
  const [draftPrice, setDraftPrice] = useState('')
  const paymentSettingQuery = usePaymentSetting(canManagePaymentPrice)
  const updatePaymentSettingMutation = useUpdatePaymentSetting()
  const closeMenu = () => setMenuAnchor(null)
  const perReviewPrice = paymentSettingQuery.data?.per_review_price || 0

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(value) || 0)

  const openPriceDialog = () => {
    setDraftPrice(perReviewPrice ? String(perReviewPrice) : '')
    setPriceDialogOpen(true)
  }

  const handleSavePrice = () => {
    const price = Number(draftPrice)
    if (!Number.isFinite(price) || price <= 0) {
      alert('Please enter a valid per review price')
      return
    }

    updatePaymentSettingMutation.mutate(price, {
      onSuccess: () => setPriceDialogOpen(false),
      onError: (err) => alert(err?.error || 'Failed to update per review price'),
    })
  }

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
              {canManagePaymentPrice && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.5, border: '1px solid #333', borderRadius: 1, bgcolor: '#151515' }}>
                  <Typography variant="caption" sx={{ color: '#bbb', whiteSpace: 'nowrap' }}>
                    Price: {formatCurrency(perReviewPrice)}
                  </Typography>
                  <Button
                    color="inherit"
                    size="small"
                    onClick={openPriceDialog}
                    disabled={updatePaymentSettingMutation.isPending}
                    sx={{ minWidth: 0, p: '2px 6px', fontSize: '0.7rem' }}
                  >
                    Edit
                  </Button>
                </Box>
              )}
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
              {canManagePaymentPrice && (
                <MenuItem onClick={() => { closeMenu(); openPriceDialog() }}>
                  Review Price: {formatCurrency(perReviewPrice)}
                </MenuItem>
              )}
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
      {canManagePaymentPrice && (
        <Dialog
          open={priceDialogOpen}
          onClose={() => setPriceDialogOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: '#151515',
              color: '#fff',
              border: '1px solid #333',
              width: 'min(420px, calc(100vw - 32px))',
            },
          }}
        >
          <DialogTitle sx={{ color: '#fff' }}>Edit Review Price</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              size="small"
              type="number"
              label="Per review price"
              value={draftPrice}
              onChange={(event) => setDraftPrice(event.target.value)}
              sx={{
                mt: 1,
                input: { color: '#fff' },
                label: { color: '#aaa' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#fff' },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPriceDialogOpen(false)} sx={{ color: '#bbb' }}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePrice}
              disabled={updatePaymentSettingMutation.isPending}
              variant="contained"
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
            >
              {updatePaymentSettingMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Navbar;
