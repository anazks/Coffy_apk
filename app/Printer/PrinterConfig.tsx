// import React, { useEffect, useMemo, useState } from "react";
// import { Alert, Button, StyleSheet, Text, View } from "react-native";
// import {
//   Printer,
//   PrinterConstants,
//   type PrinterStatusResponse,
// } from "react-native-esc-pos-printer";

// export default function PrinterConfig() {
//   const [printing, setPrinting] = useState(false);
//   const [status, setStatus] = useState<PrinterStatusResponse | null>(null);

//   // Example printer object (replace with actual printer details if available)
//   const printer = {
//     target: "USB:001", // You must pass the real target ID
//     deviceName: "My USB Printer",
//   };

//   const printerInstance = useMemo(
//     () =>
//       new Printer({
//         target: printer.target,
//         deviceName: printer.deviceName,
//       }),
//     [printer]
//   );

//   useEffect(() => {
//     // Monitor printer status continuously
//     const stop = Printer.monitorPrinter(printerInstance, (nextStatus) => {
//       setStatus(nextStatus);
//     });

//     return stop;
//   }, [printerInstance]);

//   const printSimpleReceipt = async () => {
//     try {
//       setPrinting(true);

//       const res = await printerInstance.addQueueTask(async () => {
//         await Printer.tryToConnectUntil(
//           printerInstance,
//           (status) => status.online.statusCode === PrinterConstants.TRUE
//         );

//         await printerInstance.addTextAlign(PrinterConstants.ALIGN_CENTER);
//         await printerInstance.addTextSize({ width: 2, height: 2 });
//         await printerInstance.addText("Hello from PrinterConfig!");
//         await printerInstance.addFeedLine();
//         await printerInstance.addCut();

//         const result = await printerInstance.sendData();
//         await printerInstance.disconnect();
//         return result;
//       });

//       if (res) {
//         setStatus(res);
//         Alert.alert("Success", "Print job completed!");
//       }
//     } catch (e) {
//       console.log("Print Error:", e);
//       Alert.alert("Error", "Failed to print");
//       await printerInstance.disconnect();
//     } finally {
//       setPrinting(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>PrinterConfig</Text>
//       <Text>Status: {status ? JSON.stringify(status.online) : "Unknown"}</Text>
//       <Button
//         title={printing ? "Printing..." : "Test Print"}
//         onPress={printSimpleReceipt}
//         disabled={printing}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
// });
import React from 'react'
import { Text, View } from 'react-native'

export default function PrinterConfig() {
  return (
    <View>
      <Text>PrinterConfig</Text>
    </View>
  )
}