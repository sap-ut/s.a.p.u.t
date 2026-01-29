import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Divider,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  PictureAsPdf as PdfIcon,
  QrCode as QrCodeIcon,
  Calculate as CalculateIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  AttachMoney as MoneyIcon,
  DateRange as DateIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode.react';
import dayjs from 'dayjs';

const PerformanceBilling = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const printRef = useRef();
  const [activeStep, setActiveStep] = useState(0);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    performanceNo: `PERF-${dayjs().format('YYMMDD')}-001`,
    performanceDate: dayjs().format('YYYY-MM-DD'),
    customerName: '',
    customerAddress: '',
    customerCity: '',
    customerState: '',
    customerMobile: '',
    customerEmail: '',
    customerGstin: '',
    customerStateCode: '',
    
    // Glass Specifications
    vomArea: '',
    evenCut: 'yes',
    otherFabrication: '',
    excelImpact: 'medium',
    inputUnit: 'MM',
    discountPercent: 0,
    
    // Bill To Same
    billToSame: true,
    
    // Additional Charges
    holeCharges: 0,
    cutoutCharges: 0,
    documentCharge: 0,
    freight: 0,
    gstPercent: 18,
    
    // Payment
    paymentMethod: 'online',
    termsConditions: 'Payment due within 15 days\nGoods once sold will not be taken back\nSubject to Mumbai jurisdiction',
  });

  // Items State
  const [items, setItems] = useState([
    {
      id: 1,
      item: 'Clear Glass 6mm',
      actualWidth: 1200,
      actualHeight: 1800,
      chargeableWidth: 1200,
      chargeableHeight: 1800,
      qty: 10,
      area: 21.6,
      rate: 450,
      amount: 9720,
      remark: 'Polish Edges'
    },
    {
      id: 2,
      item: 'Toughened Glass 10mm',
      actualWidth: 900,
      actualHeight: 1200,
      chargeableWidth: 900,
      chargeableHeight: 1200,
      qty: 15,
      area: 16.2,
      rate: 650,
      amount: 10530,
      remark: 'Round Corners'
    },
    {
      id: 3,
      item: 'Laminated Glass',
      actualWidth: 600,
      actualHeight: 900,
      chargeableWidth: 600,
      chargeableHeight: 900,
      qty: 20,
      area: 10.8,
      rate: 850,
      amount: 9180,
      remark: 'Clear Lamination'
    }
  ]);

  // Steps
  const steps = ['Customer Details', 'Glass Specifications', 'Items', 'Review & Generate'];

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const additionalCharges = formData.holeCharges + formData.cutoutCharges + 
                             formData.documentCharge + formData.freight;
    const gstAmount = (subtotal * formData.gstPercent) / 100;
    const discountAmount = (subtotal * formData.discountPercent) / 100;
    const grandTotal = subtotal + gstAmount + additionalCharges - discountAmount;
    
    return {
      subtotal,
      gstAmount,
      discountAmount,
      additionalCharges,
      grandTotal
    };
  };

  const totals = calculateTotals();

  // Handlers
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-calculate area and amount if dimensions or qty change
        if (['chargeableWidth', 'chargeableHeight', 'qty'].includes(field)) {
          const area = (updatedItem.chargeableWidth * updatedItem.chargeableHeight * updatedItem.qty) / 1000000;
          updatedItem.area = parseFloat(area.toFixed(3));
          updatedItem.amount = parseFloat((updatedItem.area * updatedItem.rate).toFixed(2));
        }
        
        // Recalculate amount if rate changes
        if (field === 'rate') {
          updatedItem.amount = parseFloat((updatedItem.area * value).toFixed(2));
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setItems(updatedItems);
  };

  const addNewItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const newItem = {
      id: newId,
      item: `Glass Item ${newId}`,
      actualWidth: 0,
      actualHeight: 0,
      chargeableWidth: 0,
      chargeableHeight: 0,
      qty: 1,
      area: 0,
      rate: 0,
      amount: 0,
      remark: ''
    };
    setItems([...items, newItem]);
    toast.success('New item added');
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    toast.success('Item removed');
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `PERF-${formData.performanceNo}`,
    onAfterPrint: () => toast.success('Bill printed successfully')
  });

  const handleSave = () => {
    // Save logic here
    const billData = {
      ...formData,
      items,
      totals,
      createdAt: new Date().toISOString()
    };
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Performance bill saved successfully!');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const generatePDF = () => {
    toast.success('PDF generation started...');
    // PDF generation logic
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      performanceNo: `PERF-${dayjs().format('YYMMDD')}-001`,
      performanceDate: dayjs().format('YYYY-MM-DD'),
      customerName: '',
      customerAddress: '',
      customerCity: '',
      customerState: '',
      customerMobile: '',
      customerEmail: '',
      customerGstin: '',
      customerStateCode: '',
      vomArea: '',
      evenCut: 'yes',
      otherFabrication: '',
      excelImpact: 'medium',
      inputUnit: 'MM',
      discountPercent: 0,
      billToSame: true,
      holeCharges: 0,
      cutoutCharges: 0,
      documentCharge: 0,
      freight: 0,
      gstPercent: 18,
      paymentMethod: 'online',
      termsConditions: 'Payment due within 15 days\nGoods once sold will not be taken back\nSubject to Mumbai jurisdiction',
    });
    setItems([]);
    toast.success('Form reset successfully');
  };

  // Steps Content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon /> Customer Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={formData.customerName}
                    onChange={(e) => handleFormChange('customerName', e.target.value)}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={formData.customerMobile}
                    onChange={(e) => handleFormChange('customerMobile', e.target.value)}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={formData.customerAddress}
                    onChange={(e) => handleFormChange('customerAddress', e.target.value)}
                    InputProps={{
                      startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.customerCity}
                    onChange={(e) => handleFormChange('customerCity', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="State"
                    value={formData.customerState}
                    onChange={(e) => handleFormChange('customerState', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleFormChange('customerEmail', e.target.value)}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="GSTIN"
                    value={formData.customerGstin}
                    onChange={(e) => handleFormChange('customerGstin', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon /> Glass Specifications
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="VOM - Sq.mt."
                    type="number"
                    value={formData.vomArea}
                    onChange={(e) => handleFormChange('vomArea', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Even Cut</InputLabel>
                    <Select
                      value={formData.evenCut}
                      label="Even Cut"
                      onChange={(e) => handleFormChange('evenCut', e.target.value)}
                    >
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Other Fabrication"
                    value={formData.otherFabrication}
                    onChange={(e) => handleFormChange('otherFabrication', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Excel Impact</InputLabel>
                    <Select
                      value={formData.excelImpact}
                      label="Excel Impact"
                      onChange={(e) => handleFormChange('excelImpact', e.target.value)}
                    >
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Input Unit</InputLabel>
                    <Select
                      value={formData.inputUnit}
                      label="Input Unit"
                      onChange={(e) => handleFormChange('inputUnit', e.target.value)}
                    >
                      <MenuItem value="MM">MM</MenuItem>
                      <MenuItem value="INCH">Inch</MenuItem>
                      <MenuItem value="FT">Feet</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Discount %"
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => handleFormChange('discountPercent', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: '%',
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalculateIcon /> Items & Measurements
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addNewItem}
                  sx={{ borderRadius: 2 }}
                >
                  Add Item
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small" className="performance-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="center">Actual (mm)</TableCell>
                      <TableCell align="center">Chargeable (mm)</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell align="center">Area (Sq.mt)</TableCell>
                      <TableCell align="center">Rate</TableCell>
                      <TableCell align="center">Amount</TableCell>
                      <TableCell align="center">Remark</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <TextField
                            size="small"
                            value={item.item}
                            onChange={(e) => handleItemChange(item.id, 'item', e.target.value)}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              size="small"
                              type="number"
                              value={item.actualWidth}
                              onChange={(e) => handleItemChange(item.id, 'actualWidth', parseFloat(e.target.value) || 0)}
                              sx={{ width: 80 }}
                            />
                            <Typography sx={{ alignSelf: 'center' }}>×</Typography>
                            <TextField
                              size="small"
                              type="number"
                              value={item.actualHeight}
                              onChange={(e) => handleItemChange(item.id, 'actualHeight', parseFloat(e.target.value) || 0)}
                              sx={{ width: 80 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              size="small"
                              type="number"
                              value={item.chargeableWidth}
                              onChange={(e) => handleItemChange(item.id, 'chargeableWidth', parseFloat(e.target.value) || 0)}
                              sx={{ width: 80 }}
                            />
                            <Typography sx={{ alignSelf: 'center' }}>×</Typography>
                            <TextField
                              size="small"
                              type="number"
                              value={item.chargeableHeight}
                              onChange={(e) => handleItemChange(item.id, 'chargeableHeight', parseFloat(e.target.value) || 0)}
                              sx={{ width: 80 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 0)}
                            sx={{ width: 70 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={item.area.toFixed(3)} color="primary" size="small" />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            InputProps={{
                              startAdornment: '₹',
                            }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" className="amount-cell">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={item.remark}
                            onChange={(e) => handleItemChange(item.id, 'remark', e.target.value)}
                            placeholder="Remark"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={8} align="right">
                        <Typography variant="h6">Total:</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" color="success.main">
                          ₹{totals.subtotal.toLocaleString('en-IN')}
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Box>
            {/* Bill Preview */}
            <div ref={printRef} style={{ display: 'none' }}>
              {/* Print content here */}
            </div>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom align="center" color="primary">
                  Performance Bill Preview
                </Typography>
                
                {/* Bill Header */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="h6">Glass Manufacturing Co.</Typography>
                      <Typography variant="body2">Performance Bill</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="h6">PERF-{formData.performanceNo}</Typography>
                      <Typography variant="body2">
                        Date: {dayjs(formData.performanceDate).format('DD/MM/YYYY')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Bill Content Preview */}
                <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                  {/* Preview content similar to your image */}
                  <Typography variant="body1" paragraph>
                    This is where your bill preview will appear exactly as in your image.
                    The actual print view will show complete bill details.
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    size="large"
                  >
                    Print Bill
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    size="large"
                  >
                    Save Bill
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PdfIcon />}
                    onClick={generatePDF}
                    size="large"
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<QrCodeIcon />}
                    onClick={() => setOpenQrDialog(true)}
                    size="large"
                  >
                    Generate QR
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Bill Summary</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" color="text.secondary">Customer Details</Typography>
                      <Typography variant="body1">{formData.customerName}</Typography>
                      <Typography variant="body2">{formData.customerAddress}</Typography>
                      <Typography variant="body2">
                        {formData.customerCity}, {formData.customerState}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" color="text.secondary">Financial Summary</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Subtotal:</Typography>
                        <Typography>₹{totals.subtotal.toLocaleString('en-IN')}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>GST ({formData.gstPercent}%):</Typography>
                        <Typography>₹{totals.gstAmount.toLocaleString('en-IN')}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Additional Charges:</Typography>
                        <Typography>₹{totals.additionalCharges.toLocaleString('en-IN')}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Grand Total:</Typography>
                        <Typography variant="h6" color="success.main">
                          ₹{totals.grandTotal.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          🏭 Performance Billing System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create professional performance bills for glass manufacturing with automatic calculations
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Box sx={{ mb: 4 }}>
        {getStepContent(activeStep)}
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleReset}
          >
            Reset
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save & Finish
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      {/* QR Dialog */}
      <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeIcon /> Payment QR Code
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
            <QRCode
              value={`https://payment.glasserp.com/pay/${formData.performanceNo}/${totals.grandTotal}`}
              size={200}
              level="H"
              includeMargin
            />
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              Scan to pay bill: PERF-{formData.performanceNo}
              <br />
              Amount: ₹{totals.grandTotal.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQrDialog(false)}>Close</Button>
          <Button variant="contained" onClick={() => {
            toast.success('QR Code downloaded');
            setOpenQrDialog(false);
          }}>
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          Performance bill saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PerformanceBilling;
