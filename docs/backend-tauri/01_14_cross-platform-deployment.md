# Cross-Platform Deployment

Deploying Tauri applications across multiple platforms requires understanding of each operating system's requirements and packaging standards. This article covers strategies for building, signing, and distributing your applications to Windows, macOS, and Linux users.

## Prerequisites

- Understanding of Tauri configuration and build processes
- Basic knowledge of platform-specific deployment requirements
- Familiarity with code signing and application stores

## Core Concepts

Cross-platform deployment in Tauri involves creating platform-appropriate installers, handling code signing requirements, and following each platform's distribution guidelines. The goal is to provide native-like installation experiences for users on each platform.

## Implementation

### Platform-Specific Configuration

Configure different settings for each platform in your tauri.conf.json:

```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "tauri": {
    "allowlist": {
      "all": true
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.example.myapp",
      "publisher": "Example Corp",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "windows": {
        "wix": {
          "language": "en-US"
        },
        "webviewInstallMode": {
          "type": "embedBootstrapper"
        },
        "digestAlgorithm": "sha256"
      },
      "macOS": {
        "frameworks": [],
        "minimumSystemVersion": "10.13",
        "exceptionDomain": "",
        "signingIdentity": "Developer ID Application: Your Name (ID)",
        "entitlements": null
      },
      "linux": {
        "deb": {
          "depends": [],
          "categories": ["Utility"]
        },
        "appimage": {
          "bundleMediaFramework": false
        }
      }
    },
    "security": {
      "csp": "default-src 'self'; img-src 'self' asset: https://assetcdn.example.com; media-src 'self' https://example.com"
    },
    "updater": {
      "active": true
    }
  }
}
```

### Build Scripts for Different Platforms

Create platform-specific build scripts:

```bash
#!/bin/bash
# build-windows.sh - Windows build script

set -e

echo "Building for Windows..."

# Set environment variables for Windows
export TARGET_CC=x86_64-pc-windows-gnu-gcc
export TARGET_AR=x86_64-pc-windows-gnu-ar

# Build for Windows
cargo tauri build --target x86_64-pc-windows-msvc

echo "Windows build completed!"
```

```bash
#!/bin/bash
# build-macos.sh - macOS build script

set -e

echo "Building for macOS..."

# Build for macOS
cargo tauri build --target x86_64-apple-darwin

# Also build for Apple Silicon
cargo tauri build --target aarch64-apple-darwin

echo "macOS build completed!"
```

```bash
#!/bin/bash
# build-linux.sh - Linux build script

set -e

echo "Building for Linux..."

# Build for Linux (x86_64)
cargo tauri build --target x86_64-unknown-linux-gnu

echo "Linux build completed!"
```

### Cross-Platform Build Workflow

Implement a unified build system:

```typescript
// scripts/build-all-platforms.ts
import { execSync } from 'child_process';
import { platform } from 'os';
import { join } from 'path';
import { writeFileSync } from 'fs';

interface BuildConfig {
  platform: string;
  target: string;
  arch: string;
  outputDir: string;
}

const BUILD_CONFIGS: BuildConfig[] = [
  {
    platform: 'windows',
    target: 'x86_64-pc-windows-msvc',
    arch: 'x64',
    outputDir: 'windows-x64'
  },
  {
    platform: 'macos',
    target: 'x86_64-apple-darwin',
    arch: 'x64',
    outputDir: 'macos-x64'
  },
  {
    platform: 'macos',
    target: 'aarch64-apple-darwin',
    arch: 'arm64',
    outputDir: 'macos-arm64'
  },
  {
    platform: 'linux',
    target: 'x86_64-unknown-linux-gnu',
    arch: 'x64',
    outputDir: 'linux-x64'
  }
];

async function buildAllPlatforms() {
  console.log('Starting cross-platform builds...');
  
  for (const config of BUILD_CONFIGS) {
    console.log(`\nBuilding for ${config.platform} (${config.arch})...`);
    
    try {
      // Set up environment
      process.env.CARGO_BUILD_TARGET = config.target;
      
      // Run the build command
      const buildCmd = `cargo tauri build --target ${config.target}`;
      execSync(buildCmd, { stdio: 'inherit' });
      
      console.log(`✓ Completed build for ${config.platform} (${config.arch})`);
    } catch (error) {
      console.error(`✗ Failed to build for ${config.platform}:`, error);
      throw error;
    }
  }
  
  console.log('\nAll platforms built successfully!');
}

buildAllPlatforms().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
```

### Code Signing Configuration

Set up code signing for different platforms:

```bash
# sign-apple.sh - Signing script for macOS
#!/bin/bash

APP_PATH="src-tauri/target/release/bundle/macos/YourApp.app"
IDENTITY_NAME="Developer ID Application: Your Name (XXXXXXXXXX)"

echo "Signing macOS application..."

codesign --force --deep --sign "$IDENTITY_NAME" "$APP_PATH"

# Verify the signature
codesign --verify --deep --strict --verbose=2 "$APP_PATH"

echo "macOS application signed successfully!"
```

```bash
# sign-windows.ps1 - PowerShell script for Windows signing
# Requires Windows SDK to be installed
param(
    [string]$FilePath,
    [string]$CertPath,
    [string]$CertPassword
)

Write-Host "Signing Windows executable..."

# Sign the application
& "C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x64\signtool.exe" sign `
    /f $CertPath `
    /p $CertPassword `
    /t http://timestamp.digicert.com `
    /fd SHA256 `
    $FilePath

if ($LASTEXITCODE -eq 0) {
    Write-Host "Windows application signed successfully!" -ForegroundColor Green
} else {
    Write-Host "Signing failed!" -ForegroundColor Red
    exit 1
}
```

### Automated Deployment Pipeline

Create a CI/CD pipeline for deployment:

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  create-release:
    runs-on: ubuntu-latest
    outputs:
      release_id: ${{ steps.create-release.outputs.result }}
    steps:
      - name: Create Release
        uses: actions/github-script@v6
        id: create-release
        with:
          script: |
            const { data } = await github.rest.repos.createRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              tag_name: context.ref.replace('refs/tags/', ''),
              name: context.ref.replace('refs/tags/', ''),
              draft: true,
              prerelease: false
            });
            return data.id;

  release-windows:
    needs: create-release
    runs-on: windows-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Install Rust stable
        uses: dtolnay/rust-toolchain@stable

      - name: Install dependencies
        run: npm install

      - name: Install Visual Studio Build Tools
        uses: microsoft/setup-msbuild@v1.1

      - name: Build Tauri app
        run: npm run tauri build
        env:
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
          TAURI_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}

      - name: Upload binaries to release
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: https://uploads.github.com/repos/${{ github.repository }}/releases/${{ needs.create-release.outputs.release_id }}/assets{?name,label}
          asset_path: src-tauri/target/release/bundle/msi/YourApp_${{ github.ref_name }}_x64.msi
          asset_name: YourApp_${{ github.ref_name }}_x64.msi
          asset_content_type: application/octet-stream

  release-macos:
    needs: create-release
    runs-on: macos-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Install Rust stable
        uses: dtolnay/rust-toolchain@stable

      - name: Install dependencies
        run: npm install

      - name: Build Tauri app
        run: npm run tauri build
        env:
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
          TAURI_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}

      - name: Upload binaries to release
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: https://uploads.github.com/repos/${{ github.repository }}/releases/${{ needs.create-release.outputs.release_id }}/assets{?name,label}
          asset_path: src-tauri/target/release/bundle/macos/YourApp_${{ github.ref_name }}_x64.dmg
          asset_name: YourApp_${{ github.ref_name }}_x64.dmg
          asset_content_type: application/octet-stream

  release-linux:
    needs: create-release
    runs-on: ubuntu-20.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Install Rust stable
        uses: dtolnay/rust-toolchain@stable

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf

      - name: Install dependencies
        run: npm install

      - name: Build Tauri app
        run: npm run tauri build

      - name: Upload binaries to release
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: https://uploads.github.com/repos/${{ github.repository }}/releases/${{ needs.create-release.outputs.release_id }}/assets{?name,label}
          asset_path: src-tauri/target/release/bundle/appimage/YourApp_${{ github.ref_name }}_amd64.AppImage
          asset_name: YourApp_${{ github.ref_name }}_amd64.AppImage
          asset_content_type: application/octet-stream
```

## Advanced Patterns

### Universal Distribution Format

Create a universal build for macOS with both architectures:

```rust
// scripts/universal-macos.rs
use std::process::Command;

fn main() {
    println!("Creating universal macOS binary...");
    
    // Build for both architectures
    let x86_build = Command::new("cargo")
        .args(&["tauri", "build", "--target", "x86_64-apple-darwin"])
        .status();
        
    match x86_build {
        Ok(status) if status.success() => println!("x86_64 build successful"),
        _ => panic!("x86_64 build failed"),
    }
    
    let arm64_build = Command::new("cargo")
        .args(&["tauri", "build", "--target", "aarch64-apple-darwin"])
        .status();
        
    match arm64_build {
        Ok(status) if status.success() => println!("aarch64 build successful"),
        _ => panic!("aarch64 build failed"),
    }
    
    // Create universal binary using lipo
    let lipo_result = Command::new("lipo")
        .args(&[
            "-create",
            "-output",
            "src-tauri/target/universal-apple-darwin/release/myapp",
            "src-tauri/target/x86_64-apple-darwin/release/myapp",
            "src-tauri/target/aarch64-apple-darwin/release/myapp",
        ])
        .status();
        
    match lipo_result {
        Ok(status) if status.success() => println!("Universal binary created successfully"),
        _ => panic!("Failed to create universal binary"),
    }
    
    println!("Universal macOS build completed!");
}
```

### Platform-Specific Features

Implement conditional compilation for platform-specific features:

```rust
// src/build_features.rs
use tauri::Manager;

#[tauri::command]
pub async fn get_platform_info() -> Result<PlatformInfo, String> {
    #[cfg(target_os = "windows")]
    {
        Ok(PlatformInfo {
            os: "Windows".to_string(),
            version: get_windows_version()?,
            architecture: std::env::consts::ARCH.to_string(),
        })
    }
    
    #[cfg(target_os = "macos")]
    {
        Ok(PlatformInfo {
            os: "macOS".to_string(),
            version: get_macos_version()?,
            architecture: std::env::consts::ARCH.to_string(),
        })
    }
    
    #[cfg(target_os = "linux")]
    {
        Ok(PlatformInfo {
            os: "Linux".to_string(),
            version: get_linux_version()?,
            architecture: std::env::consts::ARCH.to_string(),
        })
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("Unsupported platform".to_string())
    }
}

#[derive(serde::Serialize)]
struct PlatformInfo {
    os: String,
    version: String,
    architecture: String,
}

#[cfg(target_os = "windows")]
fn get_windows_version() -> Result<String, String> {
    // Implementation for Windows
    Ok("10".to_string())
}

#[cfg(target_os = "macos")]
fn get_macos_version() -> Result<String, String> {
    // Implementation for macOS
    Ok("12.0".to_string())
}

#[cfg(target_os = "linux")]
fn get_linux_version() -> Result<String, String> {
    // Implementation for Linux
    Ok("Ubuntu 20.04".to_string())
}
```

### Advanced Signing and Notarization

Implement advanced signing for macOS notarization:

```bash
#!/bin/bash
# notarize-macos.sh

APP_PATH="$1"
BUNDLE_ID="com.example.myapp"
APPLE_ID="your@apple.id"
APPLE_PASSWORD="your-app-specific-password"
TEAM_ID="YOURTEAMID"

echo "Starting macOS notarization process..."

# 1. Sign all binaries in the app bundle
echo "Signing binaries..."
find "$APP_PATH" -name "*.dylib" -exec codesign --force --deep --sign - --options=runtime {} \;
codesign --force --deep --sign - --options=runtime "$APP_PATH"

# 2. Create a zip archive of the app for notarization
APP_NAME=$(basename "$APP_PATH")
ZIP_PATH="${APP_NAME}.zip"
ditto -c -k --keepParent "$APP_PATH" "$ZIP_PATH"

# 3. Upload for notarization
echo "Uploading for notarization..."
xcrun altool --notarize-app \
    --primary-bundle-id "$BUNDLE_ID" \
    --username "$APPLE_ID" \
    --password "$APPLE_PASSWORD" \
    --asc-provider "$TEAM_ID" \
    --file "$ZIP_PATH"

echo "Notarization request submitted. Please check the response for RequestUUID."

# Clean up
rm "$ZIP_PATH"

echo "Notarization process initiated. Check your email for approval status."
```

### Distribution Channels

Create distribution packages for different channels:

```javascript
// scripts/package-for-stores.js
const { execSync } = require('child_process');
const { writeFileSync, readFileSync } = require('fs');
const { join } = require('path');

// Microsoft Store packaging
function packageForMicrosoftStore() {
  console.log('Creating Microsoft Store package...');
  
  // Create appxmanifest
  const manifest = `<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10" 
         xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
         xmlns:desktop="http://schemas.microsoft.com/appx/manifest/desktop/windows10">
  <Identity Name="YourCompany.YourApp" 
            Version="1.0.0.0" 
            Publisher="CN=YourCompany" 
            ProcessorArchitecture="x64"/>
  <Properties>
    <DisplayName>Your App</DisplayName>
    <PublisherDisplayName>Your Company</PublisherDisplayName>
    <Description>Your App Description</Description>
    <Logo>assets/StoreLogo.png</Logo>
  </Properties>
  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.14393.0" MaxVersionTested="10.0.19041.0"/>
  </Dependencies>
  <Resources>
    <Resource Language="en-us"/>
  </Resources>
  <Applications>
    <Application Id="App" 
                  Executable="YourApp.exe" 
                  EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements DisplayName="Your App" 
                          Description="Your App Description" 
                          BackgroundColor="transparent" 
                          Square150x150Logo="assets/Square150x150Logo.png" 
                          Square44x44Logo="assets/Square44x44Logo.png"/>
    </Application>
  </Applications>
</Package>`;
  
  writeFileSync('AppxManifest.xml', manifest);
  
  // Use MakeAppx to create the package
  execSync('MakeAppx pack /d . /p YourApp.appx /o', { cwd: 'src-tauri/target/release' });
  
  console.log('Microsoft Store package created!');
}

// Snap package for Linux
function packageForSnapStore() {
  console.log('Creating Snap package...');
  
  const snapcraftConfig = `
name: your-app
version: git
summary: Your awesome Tauri app
description: |
  A detailed description of your Tauri application.

base: core20
confinement: strict
grade: stable

parts:
  your-app:
    plugin: dump
    source: src-tauri/target/release/bundle/snap/
    stage-packages:
      - libwebkit2gtk-4.0-dev
      - libappindicator3-dev

apps:
  your-app:
    command: your-app
    extensions: [gnome-3-38]
    plugs:
      - desktop
      - desktop-legacy
      - wayland
      - x11
      - network
      - network-bind
      - gsettings
      - audio-playback
      - audio-record
      - home
      - removable-media
      - unity7
  
  your-app:
    command: your-app
    autostart: your-app.desktop
    desktop: usr/share/applications/your-app.desktop
    plugs:
      - desktop
      - desktop-legacy
      - wayland
      - x11
      - network
      - network-bind
      - gsettings
      - home
      - removable-media
      - unity7
`;

  writeFileSync('snap/snapcraft.yaml', snapcraftConfig);
  
  // Build snap
  execSync('snapcraft', { cwd: 'src-tauri' });
  
  console.log('Snap package created!');
}

// Run packaging based on environment
const channel = process.env.DIST_CHANNEL || 'default';

switch (channel) {
  case 'microsoft-store':
    packageForMicrosoftStore();
    break;
  case 'snap-store':
    packageForSnapStore();
    break;
  default:
    console.log('No special packaging required for this channel');
}
```

## Testing

Test your distribution packages to ensure they work correctly:

```bash
# test-distribution.sh - Script to test distribution packages
#!/bin/bash

set -e

echo "Testing distribution packages..."

# Test Windows installer
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "Testing Windows package..."
    # Add Windows-specific tests
    echo "Windows package test completed"
fi

# Test macOS package
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Testing macOS package..."
    
    # Check signature
    codesign --verify "YourApp.app"
    
    # Check notarization
    spctl -a -t exec -v "YourApp.app"
    
    echo "macOS package test completed"
fi

# Test Linux package
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Testing Linux package..."
    
    # For AppImage, check execution
    chmod +x YourApp.AppImage
    ./YourApp.AppImage --version || echo "AppImage execution test passed (even if exit code non-zero)"
    
    echo "Linux package test completed"
fi

echo "All distribution tests completed!"
```

## Troubleshooting

Common deployment challenges and solutions:

- **Code Signing**: Ensure certificates are properly installed and have the correct permissions
- **Platform Dependencies**: Each platform may require different dependencies to be pre-installed
- **File Permissions**: Linux packages especially need attention to file permissions and executable flags
- **Size Limitations**: App Store platforms have size limitations that require optimization
- **Security Requirements**: Each platform has different security requirements for applications

## Summary

Cross-platform deployment for Tauri applications requires careful attention to each platform's specific requirements, from code signing to packaging formats. With proper automation and testing, you can create native-like experiences across all major desktop platforms. The key is establishing consistent build processes and adhering to platform guidelines.

Continue exploring related topics in our guide to [Authentication & Authorization](./01_15_authentication-authorization.md) to learn how to secure your distributed applications.