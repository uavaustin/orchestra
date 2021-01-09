# Image-Rec Auto Service

The image-rec service targets a Jetson Xavier device. The `Makefile` provides the ability
to build and test on different devices. The two images, x86 and ARM, will be very similar
typically if tests pass in one container, they should pass in the other. If possible,
please test code on the Jetson device before merging with master.

### On x86
To build:

```
make image-rec-auto
```

To test:

```
make image-rec-auto-test
```

### On ARM
To build:

```
make image-rec-auto JETSON=true
```

To test:
```
make image-rec-auto-test JETSON=true
```