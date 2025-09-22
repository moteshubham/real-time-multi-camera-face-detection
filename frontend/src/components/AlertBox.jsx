const AlertBox = ({ message, type }) => {
    return (
        <div className={`alert-box ${type}`}>
            {message}
        </div>
    );
};

export default AlertBox;

        