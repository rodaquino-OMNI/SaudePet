#!/bin/bash

# PetVet WhatsApp Message Simulator
# Simulates WhatsApp webhook messages for local development

set -e

WEBHOOK_URL="${WEBHOOK_URL:-http://localhost:3001/webhook/whatsapp}"
PHONE_NUMBER="${PHONE_NUMBER:-5511999990001}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐾 PetVet WhatsApp Simulator${NC}"
echo "================================"
echo ""

# Function to send a text message
send_text_message() {
    local message="$1"
    local timestamp=$(date +%s)

    echo -e "${YELLOW}📤 Sending: ${NC}$message"

    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "BUSINESS_ACCOUNT_ID",
                "changes": [{
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "15551234567",
                            "phone_number_id": "PHONE_NUMBER_ID"
                        },
                        "contacts": [{
                            "profile": { "name": "Test User" },
                            "wa_id": "'"$PHONE_NUMBER"'"
                        }],
                        "messages": [{
                            "from": "'"$PHONE_NUMBER"'",
                            "id": "wamid.'"$timestamp"'",
                            "timestamp": "'"$timestamp"'",
                            "text": { "body": "'"$message"'" },
                            "type": "text"
                        }]
                    },
                    "field": "messages"
                }]
            }]
        }' | jq . 2>/dev/null || echo "Response received"

    echo ""
}

# Function to send an interactive reply
send_interactive_reply() {
    local button_id="$1"
    local button_text="$2"
    local timestamp=$(date +%s)

    echo -e "${YELLOW}📤 Sending button reply: ${NC}$button_text (ID: $button_id)"

    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "BUSINESS_ACCOUNT_ID",
                "changes": [{
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "15551234567",
                            "phone_number_id": "PHONE_NUMBER_ID"
                        },
                        "contacts": [{
                            "profile": { "name": "Test User" },
                            "wa_id": "'"$PHONE_NUMBER"'"
                        }],
                        "messages": [{
                            "from": "'"$PHONE_NUMBER"'",
                            "id": "wamid.'"$timestamp"'",
                            "timestamp": "'"$timestamp"'",
                            "type": "interactive",
                            "interactive": {
                                "type": "button_reply",
                                "button_reply": {
                                    "id": "'"$button_id"'",
                                    "title": "'"$button_text"'"
                                }
                            }
                        }]
                    },
                    "field": "messages"
                }]
            }]
        }' | jq . 2>/dev/null || echo "Response received"

    echo ""
}

# Function to send a list reply
send_list_reply() {
    local row_id="$1"
    local row_title="$2"
    local timestamp=$(date +%s)

    echo -e "${YELLOW}📤 Sending list selection: ${NC}$row_title (ID: $row_id)"

    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "BUSINESS_ACCOUNT_ID",
                "changes": [{
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "15551234567",
                            "phone_number_id": "PHONE_NUMBER_ID"
                        },
                        "contacts": [{
                            "profile": { "name": "Test User" },
                            "wa_id": "'"$PHONE_NUMBER"'"
                        }],
                        "messages": [{
                            "from": "'"$PHONE_NUMBER"'",
                            "id": "wamid.'"$timestamp"'",
                            "timestamp": "'"$timestamp"'",
                            "type": "interactive",
                            "interactive": {
                                "type": "list_reply",
                                "list_reply": {
                                    "id": "'"$row_id"'",
                                    "title": "'"$row_title"'"
                                }
                            }
                        }]
                    },
                    "field": "messages"
                }]
            }]
        }' | jq . 2>/dev/null || echo "Response received"

    echo ""
}

# Interactive menu
show_menu() {
    echo -e "${GREEN}Select an action:${NC}"
    echo "1) Send 'Oi' (start conversation)"
    echo "2) Send 'Meus pets' (list pets)"
    echo "3) Send 'Consulta' (start consultation)"
    echo "4) Send custom text message"
    echo "5) Simulate button reply"
    echo "6) Simulate list selection"
    echo "7) Run full consultation flow"
    echo "8) Change phone number (current: $PHONE_NUMBER)"
    echo "9) Exit"
    echo ""
}

# Full consultation flow simulation
run_consultation_flow() {
    echo -e "${BLUE}Running full consultation flow...${NC}"
    echo ""

    send_text_message "Oi"
    sleep 2

    send_interactive_reply "start_consultation" "Nova Consulta"
    sleep 2

    send_list_reply "pet_rex" "Rex"
    sleep 2

    send_text_message "Ele está coçando muito e perdendo pelo"
    sleep 2

    send_text_message "Começou há 3 dias"
    sleep 2

    send_text_message "Não mudou a ração"
    sleep 2

    echo -e "${GREEN}✅ Consultation flow completed!${NC}"
}

# Main loop
main() {
    while true; do
        show_menu
        read -p "Choose option: " choice

        case $choice in
            1) send_text_message "Oi" ;;
            2) send_text_message "Meus pets" ;;
            3) send_text_message "Consulta" ;;
            4)
                read -p "Enter message: " custom_message
                send_text_message "$custom_message"
                ;;
            5)
                read -p "Enter button ID: " btn_id
                read -p "Enter button text: " btn_text
                send_interactive_reply "$btn_id" "$btn_text"
                ;;
            6)
                read -p "Enter row ID: " row_id
                read -p "Enter row title: " row_title
                send_list_reply "$row_id" "$row_title"
                ;;
            7) run_consultation_flow ;;
            8)
                read -p "Enter new phone number: " PHONE_NUMBER
                echo "Phone number changed to: $PHONE_NUMBER"
                ;;
            9)
                echo "Goodbye! 🐾"
                exit 0
                ;;
            *)
                echo "Invalid option"
                ;;
        esac

        echo ""
        sleep 1
    done
}

# Check if running in non-interactive mode
if [ "$1" == "--flow" ]; then
    run_consultation_flow
elif [ "$1" == "--message" ] && [ -n "$2" ]; then
    send_text_message "$2"
else
    main
fi
