#!/bin/bash

# Get script dir
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Download price data
curl -o ${SCRIPT_DIR}/PriceTable.zip 'https://eu.tamrieltradecentre.com/download/PriceTable'
unzip -o ${SCRIPT_DIR}/PriceTable.zip -d ${SCRIPT_DIR}/PriceTable

# Remove old files before replacing
rm ${SCRIPT_DIR}/PriceTableEU.lua
rm ${SCRIPT_DIR}/ItemLookUpTable_EN.lua

# Copy price data
mv ${SCRIPT_DIR}/PriceTable/PriceTableEU.lua ${SCRIPT_DIR}/PriceTableEU.lua
mv ${SCRIPT_DIR}/PriceTable/ItemLookUpTable_EN.lua ${SCRIPT_DIR}/ItemLookUpTable_EN.lua

# Cleanup
rm -rf ${SCRIPT_DIR}/PriceTable
rm ${SCRIPT_DIR}/PriceTable.zip

echo "Done refreshing price table."

python ${SCRIPT_DIR}/convert_eso_price.py

echo "Parsing finished."
echo "Cleaning up"

rm ${SCRIPT_DIR}/PriceTableEU.lua
rm ${SCRIPT_DIR}/ItemLookUpTable_EN.lua
