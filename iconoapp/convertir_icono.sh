#!/bin/bash

# Nombre de la imagen original
imagen_original="icono.png"

# Tamaños comunes para iconos en Linux
tamanos=(16 24 32 48 64 128 256 512)

# Directorio de salida para los iconos
directorio_salida="iconos"

# Crear el directorio de salida si no existe
mkdir -p "$directorio_salida"

# Convertir la imagen a diferentes tamaños
for tamano in "${tamanos[@]}"; do
    convert "$imagen_original" -resize "${tamano}x${tamano}" "$directorio_salida/icono_${tamano}x${tamano}.png"
done

# Crear un archivo .icon con los diferentes tamaños
cat <<EOF > "$directorio_salida/icono.icon"
[Icon Theme]
Name=IconoPersonalizado
Comment=Icono personalizado para Linux

[16x16/apps]
Size=16
Context=Apps
Type=Fixed
Icon=icono_16x16.png

[24x24/apps]
Size=24
Context=Apps
Type=Fixed
Icon=icono_24x24.png

[32x32/apps]
Size=32
Context=Apps
Type=Fixed
Icon=icono_32x32.png

[48x48/apps]
Size=48
Context=Apps
Type=Fixed
Icon=icono_48x48.png

[64x64/apps]
Size=64
Context=Apps
Type=Fixed
Icon=icono_64x64.png

[128x128/apps]
Size=128
Context=Apps
Type=Fixed
Icon=icono_128x128.png

[256x256/apps]
Size=256
Context=Apps
Type=Fixed
Icon=icono_256x256.png

[512x512/apps]
Size=512
Context=Apps
Type=Fixed
Icon=icono_512x512.png
EOF

echo "Iconos generados en el directorio: $directorio_salida"
