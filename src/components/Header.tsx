import { Palette } from "lucide-react";

const Header = () => {
    return (
        <header className="border-b border-gray-200 py-4 px-6 bg-white sticky top-0 z-10 w-full">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 rounded-md">
                        <Palette className="text-indigo-600" />
                    </div>
                    <span className="ml-3 text-xl font-medium text-gray-800">CustomizeIt</span>
                </div>

                <div className="hidden md:flex items-center space-x-6">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium">1</div>
                        <span className="ml-2 font-medium text-indigo-600">Design</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">2</div>
                        <span className="ml-2 text-gray-500">Buy/Sell</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">3</div>
                        <span className="ml-2 text-gray-500">Finish</span>
                    </div>
                </div>

                <button id="next-button" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md font-medium transition duration-200">
                    Next: Buy/Sell
                </button>
            </div>
        </header>
    )
}

export default Header;