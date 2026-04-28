import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { Calendar, AlertTriangle, Clock } from "lucide-react";

const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, cartItems, navigate } = useAppContext();
  
  const getExpiryStatus = () => {
    if (!product.expiryDate) return null;
    
    const currentDate = new Date();
    const expiryDate = new Date(product.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return {
        status: 'expired',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: <AlertTriangle className="w-3 h-3" />,
        text: `Expired ${Math.abs(daysUntilExpiry)} days ago`
      };
    } else if (daysUntilExpiry <= 3) {
      return {
        status: 'critical',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        icon: <Clock className="w-3 h-3" />,
        text: daysUntilExpiry === 0 ? 'Expires today' : `Expires in ${daysUntilExpiry} days`
      };
    } else if (daysUntilExpiry <= 7) {
      return {
        status: 'warning',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: <Calendar className="w-3 h-3" />,
        text: `Expires in ${daysUntilExpiry} days`
      };
    }
    return null;
  };
  
  const expiryStatus = getExpiryStatus();
  return (
    product && (
      <div
        onClick={() => {
          navigate(
            `/product/${product.category.toLowerCase()}/${product?._id}`
          );
          scrollTo(0, 0);
        }}
        className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white min-w-56 max-w-56 w-full"
      >
        <div className="group cursor-pointer flex items-center justify-center px-2">
          <img
            className="group-hover:scale-105 transition max-w-26 md:max-w-36"
            src={`http://localhost:5000/images/${product.image[0]}`}
            alt={product.name}
          />
        </div>
        <div className="text-gray-500/60 text-sm">
          <p>{product.category}</p>
          <p className="text-gray-700 font-medium text-lg truncate w-full">
            {product.name}
          </p>
          {expiryStatus && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${expiryStatus.color} mb-2`}>
              {expiryStatus.icon}
              <span>{expiryStatus.text}</span>
            </div>
          )}
          <div className="flex items-center gap-0.5">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <img
                  key={i}
                  src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                  alt="rating"
                  className="w-3 md:w-3.5"
                />
              ))}
            <p>(4)</p>
          </div>
          <div className="flex items-end justify-between mt-3">
            <p className="md:text-xl text-base font-medium text-indigo-500">
              ${product.offerPrice}{" "}
              <span className="text-gray-500/60 md:text-sm text-xs line-through">
                ${product.price}
              </span>
            </p>
            <div
              onClick={(e) => e.stopPropagation()}
              className="text-indigo-500"
            >
              {!cartItems?.[product?._id] ? (
                <button
                  onClick={() => addToCart(product?._id)}
                  className="flex items-center justify-center gap-1 bg-indigo-100 border border-indigo-300 md:w-[80px] w-[64px] h-[34px] rounded text-indigo-600 font-medium cursor-pointer"
                >
                  <img src={assets.cart_icon} alt="cart icon" />
                  Add
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-indigo-500/25 rounded select-none">
                  <button
                    onClick={() => removeFromCart(product?._id)}
                    className="cursor-pointer text-md px-2 h-full"
                  >
                    -
                  </button>
                  <span className="w-5 text-center">
                    {cartItems[product?._id]}
                  </span>
                  <button
                    onClick={() => addToCart(product?._id)}
                    className="cursor-pointer text-md px-2 h-full"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};
export default ProductCard;
