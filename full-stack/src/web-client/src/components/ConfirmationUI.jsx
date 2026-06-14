function ConfirmationUI({ msg, isError = true }) {
    return msg && <p className={`${isError ? "text-s-error" : "text-s-success"} font-semibold text-sm text-center`}>{msg}</p>
}

export default ConfirmationUI
