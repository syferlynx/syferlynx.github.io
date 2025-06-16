# Simple Hyper-V Compatibility Check Script
Write-Host "=== Hyper-V Compatibility Check ===" -ForegroundColor Green

# Check Windows version
$osInfo = Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion
Write-Host "`nOperating System:" -ForegroundColor Cyan
Write-Host "Product: $($osInfo.WindowsProductName)" -ForegroundColor White
Write-Host "Version: $($osInfo.WindowsVersion)" -ForegroundColor White

# Check Windows edition
$windowsEdition = (Get-ComputerInfo).WindowsEditionId
Write-Host "`nWindows Edition: $windowsEdition" -ForegroundColor Cyan

$supportedEditions = @("Professional", "Enterprise", "Education", "Pro", "ProWorkstation")
$editionSupported = $supportedEditions | Where-Object { $windowsEdition -like "*$_*" }

if ($editionSupported) {
    Write-Host "Windows edition supports Hyper-V" -ForegroundColor Green
} else {
    Write-Host "Windows edition may not support Hyper-V" -ForegroundColor Red
    Write-Host "Home editions do not support Hyper-V" -ForegroundColor Yellow
}

# Check processor
Write-Host "`nProcessor Check:" -ForegroundColor Cyan
$processor = Get-WmiObject -Class Win32_Processor | Select-Object -First 1

if ($processor.AddressWidth -eq 64) {
    Write-Host "64-bit processor detected" -ForegroundColor Green
} else {
    Write-Host "64-bit processor required" -ForegroundColor Red
}

# Check memory
$memory = Get-WmiObject -Class Win32_ComputerSystem
$memoryGB = [math]::Round($memory.TotalPhysicalMemory / 1GB, 2)
Write-Host "`nMemory: $memoryGB GB" -ForegroundColor Cyan
if ($memoryGB -ge 4) {
    Write-Host "Sufficient memory for Hyper-V" -ForegroundColor Green
} else {
    Write-Host "Low memory - 4GB+ recommended" -ForegroundColor Yellow
}

# Check Hyper-V status
Write-Host "`nHyper-V Status:" -ForegroundColor Cyan
try {
    $hyperVFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -ErrorAction SilentlyContinue
    if ($hyperVFeature) {
        Write-Host "Status: $($hyperVFeature.State)" -ForegroundColor White
        if ($hyperVFeature.State -eq "Enabled") {
            Write-Host "Hyper-V is already enabled" -ForegroundColor Green
        } else {
            Write-Host "Hyper-V is available but not enabled" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Could not determine Hyper-V status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Could not check Hyper-V status (may need admin privileges)" -ForegroundColor Yellow
}

# Hardware requirements check
Write-Host "`nHardware Requirements:" -ForegroundColor Cyan
try {
    $hyperVSupport = Get-ComputerInfo | Select-Object -Property HyperV*
    
    if ($hyperVSupport.HyperVRequirementVMMonitorModeExtensions) {
        Write-Host "VM Monitor Mode Extensions: Supported" -ForegroundColor Green
    } else {
        Write-Host "VM Monitor Mode Extensions: Not Supported" -ForegroundColor Red
    }
    
    if ($hyperVSupport.HyperVRequirementVirtualizationFirmwareEnabled) {
        Write-Host "Virtualization Enabled in Firmware: Yes" -ForegroundColor Green
    } else {
        Write-Host "Virtualization Enabled in Firmware: No" -ForegroundColor Red
        Write-Host "Enable virtualization in BIOS/UEFI settings" -ForegroundColor Yellow
    }
    
    if ($hyperVSupport.HyperVRequirementSecondLevelAddressTranslation) {
        Write-Host "Second Level Address Translation: Supported" -ForegroundColor Green
    } else {
        Write-Host "Second Level Address Translation: Not Supported" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Could not check all hardware requirements" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Green
if ($editionSupported -and $processor.AddressWidth -eq 64) {
    Write-Host "Your system appears compatible with Hyper-V" -ForegroundColor Green
    
    if ($hyperVFeature -and $hyperVFeature.State -eq "Disabled") {
        Write-Host "`nNext step: Run setup-hyperv-admin.bat to enable Hyper-V" -ForegroundColor Cyan
    } elseif ($hyperVFeature -and $hyperVFeature.State -eq "Enabled") {
        Write-Host "`nHyper-V is ready to use!" -ForegroundColor Green
        Write-Host "Open Hyper-V Manager from Start Menu" -ForegroundColor Cyan
    }
} else {
    Write-Host "Your system may not be compatible with Hyper-V" -ForegroundColor Red
    Write-Host "Check the requirements above" -ForegroundColor Yellow
}

Write-Host "`nPress Enter to exit..." -ForegroundColor Gray
Read-Host 
