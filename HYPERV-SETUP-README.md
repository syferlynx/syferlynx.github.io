# Hyper-V Setup Guide - Administrator Mode

This guide will help you enable and configure Hyper-V on your Windows system with administrator privileges.

## 📋 Prerequisites

### System Requirements
- **Windows Edition**: Windows 10/11 Pro, Enterprise, or Education (Home editions don't support Hyper-V)
- **Processor**: 64-bit processor with Second Level Address Translation (SLAT)
- **Memory**: 4 GB RAM minimum (8 GB+ recommended)
- **Virtualization**: Hardware virtualization support enabled in BIOS/UEFI

### Hardware Requirements
- VM Monitor Mode Extensions (VT-x on Intel, AMD-V on AMD)
- Virtualization enabled in firmware (BIOS/UEFI)
- Second Level Address Translation (EPT on Intel, NPT on AMD)
- Data Execution Prevention (DEP)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Check Compatibility First**:
   ```cmd
   powershell -ExecutionPolicy Bypass -File check-hyperv-compatibility.ps1
   ```

2. **Run Automated Setup**:
   - Double-click `setup-hyperv-admin.bat`
   - Or run: `setup-hyperv-admin.bat`
   - You'll be prompted for administrator privileges

### Option 2: Manual PowerShell Setup

1. **Open PowerShell as Administrator**:
   - Press `Win + X` → Select "Windows PowerShell (Admin)" or "Terminal (Admin)"
   - Or search "PowerShell" → Right-click → "Run as administrator"

2. **Run the setup script**:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   .\setup-hyperv.ps1
   ```

### Option 3: Manual Command Line

**Using PowerShell (Admin)**:
```powershell
# Enable Hyper-V
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -All

# Alternative using DISM
DISM /Online /Enable-Feature /All /FeatureName:Microsoft-Hyper-V
```

**Using Command Prompt (Admin)**:
```cmd
dism.exe /Online /Enable-Feature:Microsoft-Hyper-V /All
```

## 📁 Files Included

| File | Description |
|------|-------------|
| `setup-hyperv.ps1` | Main PowerShell script to enable and configure Hyper-V |
| `setup-hyperv-admin.bat` | Batch file to run PowerShell script with admin privileges |
| `check-hyperv-compatibility.ps1` | System compatibility checker |
| `HYPERV-SETUP-README.md` | This documentation file |

## 🔧 What the Setup Script Does

1. **Checks administrator privileges** - Ensures script runs with proper permissions
2. **Verifies system requirements** - Checks hardware and software compatibility
3. **Enables Hyper-V features**:
   - Microsoft-Hyper-V-All (main feature)
   - Microsoft-Hyper-V-Management-PowerShell
   - Microsoft-Hyper-V-Hypervisor
   - Microsoft-Hyper-V-Services
   - Microsoft-Hyper-V-Tools-All
4. **Configures virtual switches** - Sets up default networking
5. **Provides status summary** - Shows final configuration

## ⚠️ Important Notes

### Restart Required
- **A system restart is required** after enabling Hyper-V
- The script will offer to restart automatically
- You can restart manually if preferred

### Conflicting Software
Hyper-V may conflict with other virtualization software:
- **VMware Workstation/Player** - May need to be disabled
- **VirtualBox** - Cannot run simultaneously with Hyper-V
- **BlueStacks** - Android emulator may have issues

### BIOS/UEFI Settings
If the script reports virtualization is disabled:
1. Restart your computer
2. Enter BIOS/UEFI setup (usually F2, F12, or Del during boot)
3. Look for virtualization settings:
   - **Intel**: "Intel VT-x" or "Virtualization Technology"
   - **AMD**: "AMD-V" or "SVM Mode"
4. Enable the setting and save changes

## 🎯 After Installation

### Verify Installation
```powershell
# Check Hyper-V status
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All

# List available VMs
Get-VM

# List virtual switches
Get-VMSwitch
```

### Access Hyper-V Manager
- **Start Menu**: Search for "Hyper-V Manager"
- **Run Dialog**: `virtmgmt.msc`
- **PowerShell**: `Start-Process virtmgmt.msc`

### Useful PowerShell Commands
```powershell
# Create a new VM
New-VM -Name "MyVM" -MemoryStartupBytes 2GB -Generation 2

# Start a VM
Start-VM -Name "MyVM"

# Stop a VM
Stop-VM -Name "MyVM"

# Get VM status
Get-VM -Name "MyVM"

# Create virtual switch
New-VMSwitch -Name "External Switch" -NetAdapterName "Ethernet" -AllowManagementOS $true
```

## 🐛 Troubleshooting

### Common Issues

**"Hyper-V cannot be installed: The processor does not have required virtualization capabilities"**
- Enable virtualization in BIOS/UEFI
- Ensure you have a compatible 64-bit processor

**"Hyper-V cannot be installed: A hypervisor is already running"**
- Another virtualization software is active
- Disable VMware, VirtualBox, or similar software

**"Access Denied" or "Elevation Required"**
- Run PowerShell or Command Prompt as Administrator
- Use the provided batch file for automatic elevation

**Virtual machines won't start**
- Check if Hyper-V services are running: `Get-Service -Name vm*`
- Restart Hyper-V services: `Restart-Service -Name vmms`

### Performance Tips

1. **Allocate sufficient memory** to VMs (don't over-allocate)
2. **Use dynamic memory** when possible
3. **Store VMs on fast storage** (SSD recommended)
4. **Enable hardware acceleration** in VM settings
5. **Use Generation 2 VMs** for better performance with modern OS

## 📞 Support

### Microsoft Documentation
- [Hyper-V on Windows 10](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/)
- [System Requirements](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/reference/hyper-v-requirements)

### PowerShell Help
```powershell
# Get help for Hyper-V commands
Get-Help *VM*
Get-Command -Module Hyper-V
```

## 🔄 Uninstalling Hyper-V

If you need to remove Hyper-V:

```powershell
# Disable Hyper-V
Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
```

Or use Windows Features:
1. Open "Turn Windows features on or off"
2. Uncheck "Hyper-V"
3. Restart when prompted

---

**Note**: This setup is designed for Windows 10/11 Pro, Enterprise, and Education editions. Home editions do not support Hyper-V natively. 