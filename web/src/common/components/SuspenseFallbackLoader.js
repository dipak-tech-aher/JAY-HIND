
const SuspenseFallbackLoader = ()=>{
    return(
        <div
        style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
        }}
        >
        <div
            style={{
            border: "16px solid #f3f3f3",
            borderRadius: "50%",
            borderTop: "16px solid #3498db",
            width: "80px",
            height: "80px",
            webkitAnimation: "spin 2s linear infinite",
            animation: "spin 2s linear infinite"
            }}
        ></div>
    </div>
    )
}

export default SuspenseFallbackLoader
