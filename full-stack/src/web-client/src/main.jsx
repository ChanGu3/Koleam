import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "./index.css"
import "./tailwind.css" //[Import tailwind css in your own files to use it]
import App from "./App.jsx"
import { UIConfigCTX } from "./contexts/UIConfigCTX.jsx"
import { MemberCTX } from "./contexts/MemberCTX.jsx"
import { AdminCTX } from "./contexts/AdminCTX.jsx"
import { PopupControllerCTX } from "./Popup/PopupControllerCTX.jsx"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <UIConfigCTX>
                <MemberCTX>
                    <AdminCTX>
                        <PopupControllerCTX>
                            <App />
                        </PopupControllerCTX>
                    </AdminCTX>
                </MemberCTX>
            </UIConfigCTX>
        </QueryClientProvider>
    </StrictMode>
)
