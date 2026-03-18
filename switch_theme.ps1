# ====================================================================
# SWITCH THEME LGD v4.2 LUXE SOMBRE
# Basculer entre la version stable et la version fixée (fond uniforme)
# Auteur : Stephane / Le Generateur Digital
# ====================================================================

# Chemin du dossier styles
$stylesPath = "C:\LGD\LeGenerateurDigital_V4.2_LuxeSombre\legenerateurdigital-front\styles"

# Fichiers cibles
$stable = Join-Path $stylesPath "globals.css"
$fix = Join-Path $stylesPath "globals_v4.1_fix.css"
$backup = Join-Path $stylesPath "globals_backup.css"

# Verification des fichiers
if (!(Test-Path $stable) -or !(Test-Path $fix)) {
    Write-Host "ERREUR : Fichiers introuvables. Verifie les chemins et reessaie." -ForegroundColor Red
    exit
}

# Sauvegarde du fichier stable actuel
Copy-Item $stable $backup -Force

# Affichage du menu
Write-Host ""
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host "     SWITCH THEME - LE GENERATEUR DIGITAL"
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1 - Activer la version UNIFORME (fond #0a0a0a)"
Write-Host "2 - Restaurer la version STABLE actuelle"
Write-Host ""
$choice = Read-Host "Choisis 1 ou 2"

switch ($choice) {
    "1" {
        Copy-Item $fix $stable -Force
        Write-Host "Version UNIFORME activee (plus aucune bande sombre !)" -ForegroundColor Green
    }
    "2" {
        Copy-Item $backup $stable -Force
        Write-Host "Version STABLE restauree." -ForegroundColor Cyan
    }
    default {
        Write-Host "Choix invalide. Reessaie avec 1 ou 2." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Note : Relance ton frontend avec la commande suivante :" -ForegroundColor Yellow
Write-Host "       npm run dev" -ForegroundColor White
Write-Host ""
