# Hyper-V Compatibility Check Script
# This script checks if your system supports Hyper-V

Write-Host "=== Hyper-V Compatibility Check ===" -ForegroundColor Green
Write-Host "Checking system requirements for Hyper-V..." -ForegroundColor Yellow

# Check Windows version
$osInfo = Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, WindowsBuildLabEx
Write-Host "`nOperating System Information:" -ForegroundColor Cyan
Write-Host "Product Name: $($osInfo.WindowsProductName)" -ForegroundColor White
Write-Host "Version: $($osInfo.WindowsVersion)" -ForegroundColor White
Write-Host "Build: $($osInfo.WindowsBuildLabEx)" -ForegroundColor White

# Check if Windows edition supports Hyper-V
$windowsEdition = (Get-ComputerInfo).WindowsEditionId
$supportedEditions = @("Professional", "Enterprise", "Education", "Pro", "ProWorkstation")
$editionSupported = $supportedEditions | Where-Object { $windowsEdition -like "*$_*" }

Write-Host "`nWindows Edition Check:" -ForegroundColor Cyan
Write-Host "Current Edition: $windowsEdition" -ForegroundColor White
if ($editionSupported) {
    Write-Host "✓ Windows edition supports Hyper-V" -ForegroundColor Green
} else {
    Write-Host "✗ Windows edition may not support Hyper-V (Home editions don't support Hyper-V)" -ForegroundColor Red
}

# Check processor requirements
Write-Host "`nProcessor Requirements:" -ForegroundColor Cyan
$processor = Get-WmiObject -Class Win32_Processor | Select-Object -First 1

# Check for 64-bit processor
if ($processor.AddressWidth -eq 64) {
    Write-Host "✓ 64-bit processor detected" -ForegroundColor Green
} else {
    Write-Host "✗ 64-bit processor required" -ForegroundColor Red
}

# Check for virtualization support
try {
    $hyperVSupport = Get-ComputerInfo | Select-Object -Property HyperV*
    Write-Host "`nHyper-V Hardware Requirements:" -ForegroundColor Cyan
    
    if ($hyperVSupport.HyperVRequirementVMMonitorModeExtensions) {
        Write-Host "✓ VM Monitor Mode Extensions: Supported" -ForegroundColor Green
    } else {
        Write-Host "✗ VM Monitor Mode Extensions: Not Supported" -ForegroundColor Red
    }
    
    if ($hyperVSupport.HyperVRequirementVirtualizationFirmwareEnabled) {
        Write-Host "✓ Virtualization Enabled in Firmware: Yes" -ForegroundColor Green
    } else {
        Write-Host "✗ Virtualization Enabled in Firmware: No (Enable in BIOS/UEFI)" -ForegroundColor Red
    }
    
    if ($hyperVSupport.HyperVRequirementSecondLevelAddressTranslation) {
        Write-Host "✓ Second Level Address Translation: Supported" -ForegroundColor Green
    } else {
        Write-Host "✗ Second Level Address Translation: Not Supported" -ForegroundColor Red
    }
    
    if ($hyperVSupport.HyperVRequirementDataExecutionPreventionAvailable) {
        Write-Host "✓ Data Execution Prevention: Available" -ForegroundColor Green
    } else {
        Write-Host "✗ Data Execution Prevention: Not Available" -ForegroundColor Red
    }
} catch {
    Write-Host "Could not check hardware requirements: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Check memory requirements
$memory = Get-WmiObject -Class Win32_ComputerSystem
$memoryGB = [math]::Round($memory.TotalPhysicalMemory / 1GB, 2)
Write-Host "`nMemory Requirements:" -ForegroundColor Cyan
Write-Host "Total Physical Memory: $memoryGB GB" -ForegroundColor White
if ($memoryGB -ge 4) {
    Write-Host "✓ Sufficient memory (4GB+ recommended)" -ForegroundColor Green
} else {
    Write-Host "⚠ Low memory (4GB+ recommended for good performance)" -ForegroundColor Yellow
}

# Check current Hyper-V status
Write-Host "`nCurrent Hyper-V Status:" -ForegroundColor Cyan
try {
    $hyperVFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -ErrorAction SilentlyContinue
    if ($hyperVFeature) {
        Write-Host "Hyper-V Status: $($hyperVFeature.State)" -ForegroundColor White
        if ($hyperVFeature.State -eq "Enabled") {
            Write-Host "✓ Hyper-V is already enabled" -ForegroundColor Green
        } else {
            Write-Host "○ Hyper-V is available but not enabled" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Could not determine Hyper-V status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Could not check Hyper-V status (may need admin privileges)" -ForegroundColor Yellow
}

# Check for conflicting software
Write-Host "`nChecking for potential conflicts:" -ForegroundColor Cyan
$conflictingSoftware = @(
    "VMware Workstation",
    "VirtualBox", 
    "BlueStacks"
)

foreach ($software in $conflictingSoftware) {
    $installed = Get-WmiObject -Class Win32_Product | Where-Object { $_.Name -like "*$software*" }
    if ($installed) {
        Write-Host "⚠ Found potentially conflicting software: $($installed.Name)" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n=== Compatibility Summary ===" -ForegroundColor Green
$compatible = $true

if (-not $editionSupported) {
    Write-Host "✗ Windows edition not supported" -ForegroundColor Red
    $compatible = $false
}

if ($processor.AddressWidth -ne 64) {
    Write-Host "✗ 64-bit processor required" -ForegroundColor Red
    $compatible = $false
}

try {
    if (-not $hyperVSupport.HyperVRequirementVirtualizationFirmwareEnabled) {
        Write-Host "✗ Virtualization not enabled in firmware" -ForegroundColor Red
        $compatible = $false
    }
} catch {
    Write-Host "⚠ Could not verify all hardware requirements" -ForegroundColor Yellow
}

if ($compatible) {
    Write-Host "`n🎉 Your system appears to be compatible with Hyper-V!" -ForegroundColor Green
    Write-Host "You can proceed with enabling Hyper-V." -ForegroundColor Green
} else {
    Write-Host "`n❌ Your system may not be fully compatible with Hyper-V." -ForegroundColor Red
    Write-Host "Please address the issues above before enabling Hyper-V." -ForegroundColor Red
}

Write-Host "`nNext Steps:" -ForegroundColor Cyan
if ($hyperVFeature -and $hyperVFeature.State -eq "Disabled") {
    Write-Host "- Run setup-hyperv-admin.bat to enable Hyper-V" -ForegroundColor White
} elseif ($hyperVFeature -and $hyperVFeature.State -eq "Enabled") {
    Write-Host "- Hyper-V is ready to use!" -ForegroundColor White
    Write-Host "- Open Hyper-V Manager from Start Menu" -ForegroundColor White
} else {
    Write-Host "- Ensure your system meets all requirements" -ForegroundColor White
    Write-Host "- Enable virtualization in BIOS/UEFI if needed" -ForegroundColor White
}

Read-Host "`nPress Enter to exit" 