import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_shaders/flutter_shaders.dart';

late FragmentProgram fragmentProgram;

Future<void> main() async{
  fragmentProgram = await FragmentProgram.fromAsset('shaders/FractalWorldStar.frag');
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  MyAppState createState() => MyAppState();
}

class MyAppState extends State<MyApp> {
  double _time = 0.0; // Store time for the shader
  late Ticker _ticker;
  double pos_x = 0.0;
  double pos_y = 0.0;

  //Get tap position
  void onTapDown(BuildContext context, TapDownDetails details){
    final RenderBox box = context.findRenderObject() as RenderBox;
    final Offset localOffset = box.globalToLocal(details.globalPosition);
    setState(() {
      pos_x = localOffset.dx;
      pos_y = localOffset.dy;
    });
  }

  //Get time for uTime
  @override
  void initState() {
    super.initState();
    //Update the time every frame
    _ticker = Ticker((elapsed) {
      setState(() {
        _time = elapsed.inMilliseconds / 1000.0; // Convert milliseconds to seconds
      });
    })..start();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    const color = Colors.white;

    return MaterialApp(
        home:Scaffold(
          backgroundColor: Colors.black,
            body: ShaderBuilder(
              assetKey: 'shaders/FractalWorldStar.frag',
              child: SizedBox(width: size.width,height: size.height),
                (context,shader,child){
                    return AnimatedSampler(
                    (image,size,canvas){
                      //uSize vec2 (0 to 1)
                      shader.setFloat(0, size.width);
                      shader.setFloat(1, size.width);

                      //uColor_r vec4 (2 to 5)
                      shader.setFloat(2, color.red.toDouble() / 255);
                      shader.setFloat(3, color.green.toDouble() / 255);
                      shader.setFloat(4, color.blue.toDouble() / 255);
                      shader.setFloat(5, color.alpha.toDouble() / 255);

                      //uTime float (6)
                      shader.setFloat(6, _time);

                      //uTapOffset vec2 (7 - 8)
                      shader.setFloat(7, pos_x);
                      shader.setFloat(8, pos_y);

                      canvas.drawPaint(Paint()..shader = shader);
                      },
                      child: GestureDetector(
                        onTapDown: (TapDownDetails details) => onTapDown(context, details),
                        child: Stack(fit: StackFit.expand, children: <Widget>[
                          Container(color: Colors.white),
                          Positioned(
                            left: pos_x,
                            top: pos_y,
                            child: child!,
                          )
                        ]),
                      ),);
            })
      ));
  }

}