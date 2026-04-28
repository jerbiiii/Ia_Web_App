import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import './SearchBar.css';

const SearchBar = ({ onSearch, onDomainChange, domains = [] }) => {
    const [keyword, setKeyword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(keyword);
    };

    return (
        <div className="search-bar-container">
            <form onSubmit={handleSubmit} className="search-form">
                <input
                    type="text"
                    placeholder="Rechercher par mot-clé..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-btn">
                    <FaSearch />
                </button>
            </form>
            {domains.length > 0 && (
                <select
                    onChange={(e) => onDomainChange(e.target.value)}
                    className="domain-select"
                    defaultValue=""
                >
                    <option value="">Tous les domaines</option>
                    {domains.map(domain => (
                        <option key={domain.id} value={domain.id}>{domain.nom}</option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default SearchBar;