import "./index.css";

import { Data } from "./data.js";
import { View } from "./view.js";

Data.initialize();
Data.load();

View.initialize("app", Data);
View.display();
