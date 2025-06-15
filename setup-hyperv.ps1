# Hyper-V Setup Script - Run as Administrator
# This script enables Hyper-V and configures basic settings

Write-Host "=== Hyper-V Setup Script ===" -ForegroundColor Green
Write-Host "Checking administrator privileges..." -ForegroundColor Yellow

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Administrator privileges confirmed." -ForegroundColor Green

# Check system requirements
Write-Host "`nChecking system requirements..." -ForegroundColor Yellow

# Check if system supports Hyper-V
$hyperVSupport = Get-ComputerInfo | Select-Object -Property HyperV*
Write-Host "Hyper-V Requirements:" -ForegroundColor Cyan
$hyperVSupport | Format-List

# Check current Hyper-V status
Write-Host "`nChecking current Hyper-V status..." -ForegroundColor Yellow
try {
    $hyperVStatus = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
    Write-Host "Current Hyper-V Status: $($hyperVStatus.State)" -ForegroundColor Cyan
} catch {
    Write-Host "Could not check Hyper-V status: $($_.Exception.Message)" -ForegroundColor Red
}

# Enable Hyper-V if not already enabled
if ($hyperVStatus.State -eq "Disabled") {
    Write-Host "`nEnabling Hyper-V..." -ForegroundColor Yellow
    try {
        Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -All -NoRestart
        Write-Host "Hyper-V has been enabled successfully!" -ForegroundColor Green
        $restartRequired = $true
    } catch {
        Write-Host "Failed to enable Hyper-V: $($_.Exception.Message)" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} elseif ($hyperVStatus.State -eq "Enabled") {
    Write-Host "Hyper-V is already enabled!" -ForegroundColor Green
    $restartRequired = $false
} else {
    Write-Host "Hyper-V status is: $($hyperVStatus.State)" -ForegroundColor Yellow
    $restartRequired = $false
}

# Configure Hyper-V Manager and additional components
Write-Host "`nConfiguring Hyper-V components..." -ForegroundColor Yellow

$hyperVFeatures = @(
    "Microsoft-Hyper-V-Management-PowerShell",
    "Microsoft-Hyper-V-Hypervisor",
    "Microsoft-Hyper-V-Services",
    "Microsoft-Hyper-V-Tools-All"
)

foreach ($feature in $hyperVFeatures) {
    try {
        $featureStatus = Get-WindowsOptionalFeature -Online -FeatureName $feature
        if ($featureStatus.State -eq "Disabled") {
            Write-Host "Enabling $feature..." -ForegroundColor Cyan
            Enable-WindowsOptionalFeature -Online -FeatureName $feature -All -NoRestart
        } else {
            Write-Host "$feature is already enabled." -ForegroundColor Green
        }
    } catch {
        Write-Host "Warning: Could not configure $feature" -ForegroundColor Yellow
    }
}

# Create default virtual switch (if Hyper-V is already enabled)
if ($hyperVStatus.State -eq "Enabled") {
    Write-Host "`nConfiguring default virtual switch..." -ForegroundColor Yellow
    try {
        # Check if default switch exists
        $defaultSwitch = Get-VMSwitch -Name "Default Switch" -ErrorAction SilentlyContinue
        if (-not $defaultSwitch) {
            # Create external virtual switch
            $netAdapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up" -and $_.PhysicalMediaType -eq "802.3"} | Select-Object -First 1
            if ($netAdapter) {
                New-VMSwitch -Name "External Switch" -NetAdapterName $netAdapter.Name -AllowManagementOS $true
                Write-Host "Created external virtual switch: External Switch" -ForegroundColor Green
            }
        } else {
            Write-Host "Default Switch already exists." -ForegroundColor Green
        }
    } catch {
        Write-Host "Warning: Could not create virtual switch: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Display final status
Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "Hyper-V Configuration Summary:" -ForegroundColor Cyan

try {
    $finalStatus = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
    Write-Host "Hyper-V Status: $($finalStatus.State)" -ForegroundColor Green
} catch {
    Write-Host "Could not verify final status" -ForegroundColor Yellow
}

# Check if restart is required
if ($restartRequired) {
    Write-Host "`n*** RESTART REQUIRED ***" -ForegroundColor Red
    Write-Host "A system restart is required to complete Hyper-V installation." -ForegroundColor Yellow
    $restart = Read-Host "Would you like to restart now? (y/n)"
    if ($restart -eq "y" -or $restart -eq "Y") {
        Write-Host "Restarting system in 10 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        Restart-Computer -Force
    } else {
        Write-Host "Please restart your computer manually to complete the setup." -ForegroundColor Yellow
    }
} else {
    Write-Host "`nHyper-V is ready to use!" -ForegroundColor Green
    Write-Host "You can now:" -ForegroundColor Cyan
    Write-Host "- Open Hyper-V Manager from Start Menu" -ForegroundColor White
    Write-Host "- Use PowerShell Hyper-V cmdlets" -ForegroundColor White
    Write-Host "- Create and manage virtual machines" -ForegroundColor White
}

Write-Host "`nUseful Hyper-V Commands:" -ForegroundColor Cyan
Write-Host "Get-VM                    # List all VMs" -ForegroundColor White
Write-Host "New-VM                    # Create new VM" -ForegroundColor White
Write-Host "Start-VM                  # Start a VM" -ForegroundColor White
Write-Host "Stop-VM                   # Stop a VM" -ForegroundColor White
Write-Host "Get-VMSwitch              # List virtual switches" -ForegroundColor White

Read-Host "`nPress Enter to exit" 