export default function Page() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-between">
            <h1>Search</h1>
            <div className="search-container">
                <div className="search-input-container">
                    <input type="text" placeholder="Search for a user..." />
                </div>
                <div className="search-results-container">
                    <div className="search-results-header">
                        <h2>Results</h2>
                    </div>
                    <div className="search-results-list">
                    </div>
                </div>
            </div>
        </div>
    )
}