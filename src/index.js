import "./index.css";

import { Data } from "./data.js";
import { View } from "./view.js";

Data.initialize();
Data.loadTestData();

View.initialize("app", Data);
View.display(Data);
