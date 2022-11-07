import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("output.csv")

y = df[:9]
y["x"] = y.index
y_ = df[8:]
y_["x"] = y_.index
print(y)
print(y_)
plt.plot(y["x"], y["target"], "r-")
plt.plot(y_["x"], y_["target"], color="blue")
plt.show()