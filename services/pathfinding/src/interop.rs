// This file is generated. Do not edit
// @generated

// https://github.com/Manishearth/rust-clippy/issues/702
#![allow(unknown_lints)]
#![allow(clippy)]

#![cfg_attr(rustfmt, rustfmt_skip)]

#![allow(box_pointers)]
#![allow(dead_code)]
#![allow(missing_docs)]
#![allow(non_camel_case_types)]
#![allow(non_snake_case)]
#![allow(non_upper_case_globals)]
#![allow(trivial_casts)]
#![allow(unsafe_code)]
#![allow(unused_imports)]
#![allow(unused_results)]

use protobuf::Message as Message_imported_for_functions;
use protobuf::ProtobufEnum as ProtobufEnum_imported_for_functions;

#[derive(PartialEq,Clone,Default)]
pub struct Position {
    // message fields
    pub lat: f64,
    pub lon: f64,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for Position {}

impl Position {
    pub fn new() -> Position {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static Position {
        static mut instance: ::protobuf::lazy::Lazy<Position> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const Position,
        };
        unsafe {
            instance.get(Position::new)
        }
    }

    // double lat = 1;

    pub fn clear_lat(&mut self) {
        self.lat = 0.;
    }

    // Param is passed by value, moved
    pub fn set_lat(&mut self, v: f64) {
        self.lat = v;
    }

    pub fn get_lat(&self) -> f64 {
        self.lat
    }

    fn get_lat_for_reflect(&self) -> &f64 {
        &self.lat
    }

    fn mut_lat_for_reflect(&mut self) -> &mut f64 {
        &mut self.lat
    }

    // double lon = 2;

    pub fn clear_lon(&mut self) {
        self.lon = 0.;
    }

    // Param is passed by value, moved
    pub fn set_lon(&mut self, v: f64) {
        self.lon = v;
    }

    pub fn get_lon(&self) -> f64 {
        self.lon
    }

    fn get_lon_for_reflect(&self) -> &f64 {
        &self.lon
    }

    fn mut_lon_for_reflect(&mut self) -> &mut f64 {
        &mut self.lon
    }
}

impl ::protobuf::Message for Position {
    fn is_initialized(&self) -> bool {
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream) -> ::protobuf::ProtobufResult<()> {
        while !is.eof()? {
            let (field_number, wire_type) = is.read_tag_unpack()?;
            match field_number {
                1 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.lat = tmp;
                },
                2 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.lon = tmp;
                },
                _ => {
                    ::protobuf::rt::read_unknown_or_skip_group(field_number, wire_type, is, self.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u32 {
        let mut my_size = 0;
        if self.lat != 0. {
            my_size += 9;
        }
        if self.lon != 0. {
            my_size += 9;
        }
        my_size += ::protobuf::rt::unknown_fields_size(self.get_unknown_fields());
        self.cached_size.set(my_size);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream) -> ::protobuf::ProtobufResult<()> {
        if self.lat != 0. {
            os.write_double(1, self.lat)?;
        }
        if self.lon != 0. {
            os.write_double(2, self.lon)?;
        }
        os.write_unknown_fields(self.get_unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn get_cached_size(&self) -> u32 {
        self.cached_size.get()
    }

    fn get_unknown_fields(&self) -> &::protobuf::UnknownFields {
        &self.unknown_fields
    }

    fn mut_unknown_fields(&mut self) -> &mut ::protobuf::UnknownFields {
        &mut self.unknown_fields
    }

    fn as_any(&self) -> &::std::any::Any {
        self as &::std::any::Any
    }
    fn as_any_mut(&mut self) -> &mut ::std::any::Any {
        self as &mut ::std::any::Any
    }
    fn into_any(self: Box<Self>) -> ::std::boxed::Box<::std::any::Any> {
        self
    }

    fn descriptor(&self) -> &'static ::protobuf::reflect::MessageDescriptor {
        ::protobuf::MessageStatic::descriptor_static(None::<Self>)
    }
}

impl ::protobuf::MessageStatic for Position {
    fn new() -> Position {
        Position::new()
    }

    fn descriptor_static(_: ::std::option::Option<Position>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "lat",
                    Position::get_lat_for_reflect,
                    Position::mut_lat_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "lon",
                    Position::get_lon_for_reflect,
                    Position::mut_lon_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<Position>(
                    "Position",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for Position {
    fn clear(&mut self) {
        self.clear_lat();
        self.clear_lon();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for Position {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for Position {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

#[derive(PartialEq,Clone,Default)]
pub struct AerialPosition {
    // message fields
    pub lat: f64,
    pub lon: f64,
    pub alt_msl: f64,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for AerialPosition {}

impl AerialPosition {
    pub fn new() -> AerialPosition {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static AerialPosition {
        static mut instance: ::protobuf::lazy::Lazy<AerialPosition> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const AerialPosition,
        };
        unsafe {
            instance.get(AerialPosition::new)
        }
    }

    // double lat = 1;

    pub fn clear_lat(&mut self) {
        self.lat = 0.;
    }

    // Param is passed by value, moved
    pub fn set_lat(&mut self, v: f64) {
        self.lat = v;
    }

    pub fn get_lat(&self) -> f64 {
        self.lat
    }

    fn get_lat_for_reflect(&self) -> &f64 {
        &self.lat
    }

    fn mut_lat_for_reflect(&mut self) -> &mut f64 {
        &mut self.lat
    }

    // double lon = 2;

    pub fn clear_lon(&mut self) {
        self.lon = 0.;
    }

    // Param is passed by value, moved
    pub fn set_lon(&mut self, v: f64) {
        self.lon = v;
    }

    pub fn get_lon(&self) -> f64 {
        self.lon
    }

    fn get_lon_for_reflect(&self) -> &f64 {
        &self.lon
    }

    fn mut_lon_for_reflect(&mut self) -> &mut f64 {
        &mut self.lon
    }

    // double alt_msl = 3;

    pub fn clear_alt_msl(&mut self) {
        self.alt_msl = 0.;
    }

    // Param is passed by value, moved
    pub fn set_alt_msl(&mut self, v: f64) {
        self.alt_msl = v;
    }

    pub fn get_alt_msl(&self) -> f64 {
        self.alt_msl
    }

    fn get_alt_msl_for_reflect(&self) -> &f64 {
        &self.alt_msl
    }

    fn mut_alt_msl_for_reflect(&mut self) -> &mut f64 {
        &mut self.alt_msl
    }
}

impl ::protobuf::Message for AerialPosition {
    fn is_initialized(&self) -> bool {
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream) -> ::protobuf::ProtobufResult<()> {
        while !is.eof()? {
            let (field_number, wire_type) = is.read_tag_unpack()?;
            match field_number {
                1 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.lat = tmp;
                },
                2 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.lon = tmp;
                },
                3 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.alt_msl = tmp;
                },
                _ => {
                    ::protobuf::rt::read_unknown_or_skip_group(field_number, wire_type, is, self.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u32 {
        let mut my_size = 0;
        if self.lat != 0. {
            my_size += 9;
        }
        if self.lon != 0. {
            my_size += 9;
        }
        if self.alt_msl != 0. {
            my_size += 9;
        }
        my_size += ::protobuf::rt::unknown_fields_size(self.get_unknown_fields());
        self.cached_size.set(my_size);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream) -> ::protobuf::ProtobufResult<()> {
        if self.lat != 0. {
            os.write_double(1, self.lat)?;
        }
        if self.lon != 0. {
            os.write_double(2, self.lon)?;
        }
        if self.alt_msl != 0. {
            os.write_double(3, self.alt_msl)?;
        }
        os.write_unknown_fields(self.get_unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn get_cached_size(&self) -> u32 {
        self.cached_size.get()
    }

    fn get_unknown_fields(&self) -> &::protobuf::UnknownFields {
        &self.unknown_fields
    }

    fn mut_unknown_fields(&mut self) -> &mut ::protobuf::UnknownFields {
        &mut self.unknown_fields
    }

    fn as_any(&self) -> &::std::any::Any {
        self as &::std::any::Any
    }
    fn as_any_mut(&mut self) -> &mut ::std::any::Any {
        self as &mut ::std::any::Any
    }
    fn into_any(self: Box<Self>) -> ::std::boxed::Box<::std::any::Any> {
        self
    }

    fn descriptor(&self) -> &'static ::protobuf::reflect::MessageDescriptor {
        ::protobuf::MessageStatic::descriptor_static(None::<Self>)
    }
}

impl ::protobuf::MessageStatic for AerialPosition {
    fn new() -> AerialPosition {
        AerialPosition::new()
    }

    fn descriptor_static(_: ::std::option::Option<AerialPosition>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "lat",
                    AerialPosition::get_lat_for_reflect,
                    AerialPosition::mut_lat_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "lon",
                    AerialPosition::get_lon_for_reflect,
                    AerialPosition::mut_lon_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "alt_msl",
                    AerialPosition::get_alt_msl_for_reflect,
                    AerialPosition::mut_alt_msl_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<AerialPosition>(
                    "AerialPosition",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for AerialPosition {
    fn clear(&mut self) {
        self.clear_lat();
        self.clear_lon();
        self.clear_alt_msl();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for AerialPosition {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for AerialPosition {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

#[derive(PartialEq,Clone,Default)]
pub struct InteropMission {
    // message fields
    pub time: f64,
    pub current_mission: bool,
    pub air_drop_pos: ::protobuf::SingularPtrField<Position>,
    pub fly_zones: ::protobuf::RepeatedField<InteropMission_FlyZone>,
    pub home_pos: ::protobuf::SingularPtrField<Position>,
    pub waypoints: ::protobuf::RepeatedField<AerialPosition>,
    pub off_axis_pos: ::protobuf::SingularPtrField<Position>,
    pub emergent_pos: ::protobuf::SingularPtrField<Position>,
    pub search_area: ::protobuf::RepeatedField<AerialPosition>,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for InteropMission {}

impl InteropMission {
    pub fn new() -> InteropMission {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static InteropMission {
        static mut instance: ::protobuf::lazy::Lazy<InteropMission> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const InteropMission,
        };
        unsafe {
            instance.get(InteropMission::new)
        }
    }

    // double time = 1;

    pub fn clear_time(&mut self) {
        self.time = 0.;
    }

    // Param is passed by value, moved
    pub fn set_time(&mut self, v: f64) {
        self.time = v;
    }

    pub fn get_time(&self) -> f64 {
        self.time
    }

    fn get_time_for_reflect(&self) -> &f64 {
        &self.time
    }

    fn mut_time_for_reflect(&mut self) -> &mut f64 {
        &mut self.time
    }

    // bool current_mission = 2;

    pub fn clear_current_mission(&mut self) {
        self.current_mission = false;
    }

    // Param is passed by value, moved
    pub fn set_current_mission(&mut self, v: bool) {
        self.current_mission = v;
    }

    pub fn get_current_mission(&self) -> bool {
        self.current_mission
    }

    fn get_current_mission_for_reflect(&self) -> &bool {
        &self.current_mission
    }

    fn mut_current_mission_for_reflect(&mut self) -> &mut bool {
        &mut self.current_mission
    }

    // .interop.Position air_drop_pos = 3;

    pub fn clear_air_drop_pos(&mut self) {
        self.air_drop_pos.clear();
    }

    pub fn has_air_drop_pos(&self) -> bool {
        self.air_drop_pos.is_some()
    }

    // Param is passed by value, moved
    pub fn set_air_drop_pos(&mut self, v: Position) {
        self.air_drop_pos = ::protobuf::SingularPtrField::some(v);
    }

    // Mutable pointer to the field.
    // If field is not initialized, it is initialized with default value first.
    pub fn mut_air_drop_pos(&mut self) -> &mut Position {
        if self.air_drop_pos.is_none() {
            self.air_drop_pos.set_default();
        }
        self.air_drop_pos.as_mut().unwrap()
    }

    // Take field
    pub fn take_air_drop_pos(&mut self) -> Position {
        self.air_drop_pos.take().unwrap_or_else(|| Position::new())
    }

    pub fn get_air_drop_pos(&self) -> &Position {
        self.air_drop_pos.as_ref().unwrap_or_else(|| Position::default_instance())
    }

    fn get_air_drop_pos_for_reflect(&self) -> &::protobuf::SingularPtrField<Position> {
        &self.air_drop_pos
    }

    fn mut_air_drop_pos_for_reflect(&mut self) -> &mut ::protobuf::SingularPtrField<Position> {
        &mut self.air_drop_pos
    }

    // repeated .interop.InteropMission.FlyZone fly_zones = 4;

    pub fn clear_fly_zones(&mut self) {
        self.fly_zones.clear();
    }

    // Param is passed by value, moved
    pub fn set_fly_zones(&mut self, v: ::protobuf::RepeatedField<InteropMission_FlyZone>) {
        self.fly_zones = v;
    }

    // Mutable pointer to the field.
    pub fn mut_fly_zones(&mut self) -> &mut ::protobuf::RepeatedField<InteropMission_FlyZone> {
        &mut self.fly_zones
    }

    // Take field
    pub fn take_fly_zones(&mut self) -> ::protobuf::RepeatedField<InteropMission_FlyZone> {
        ::std::mem::replace(&mut self.fly_zones, ::protobuf::RepeatedField::new())
    }

    pub fn get_fly_zones(&self) -> &[InteropMission_FlyZone] {
        &self.fly_zones
    }

    fn get_fly_zones_for_reflect(&self) -> &::protobuf::RepeatedField<InteropMission_FlyZone> {
        &self.fly_zones
    }

    fn mut_fly_zones_for_reflect(&mut self) -> &mut ::protobuf::RepeatedField<InteropMission_FlyZone> {
        &mut self.fly_zones
    }

    // .interop.Position home_pos = 5;

    pub fn clear_home_pos(&mut self) {
        self.home_pos.clear();
    }

    pub fn has_home_pos(&self) -> bool {
        self.home_pos.is_some()
    }

    // Param is passed by value, moved
    pub fn set_home_pos(&mut self, v: Position) {
        self.home_pos = ::protobuf::SingularPtrField::some(v);
    }

    // Mutable pointer to the field.
    // If field is not initialized, it is initialized with default value first.
    pub fn mut_home_pos(&mut self) -> &mut Position {
        if self.home_pos.is_none() {
            self.home_pos.set_default();
        }
        self.home_pos.as_mut().unwrap()
    }

    // Take field
    pub fn take_home_pos(&mut self) -> Position {
        self.home_pos.take().unwrap_or_else(|| Position::new())
    }

    pub fn get_home_pos(&self) -> &Position {
        self.home_pos.as_ref().unwrap_or_else(|| Position::default_instance())
    }

    fn get_home_pos_for_reflect(&self) -> &::protobuf::SingularPtrField<Position> {
        &self.home_pos
    }

    fn mut_home_pos_for_reflect(&mut self) -> &mut ::protobuf::SingularPtrField<Position> {
        &mut self.home_pos
    }

    // repeated .interop.AerialPosition waypoints = 6;

    pub fn clear_waypoints(&mut self) {
        self.waypoints.clear();
    }

    // Param is passed by value, moved
    pub fn set_waypoints(&mut self, v: ::protobuf::RepeatedField<AerialPosition>) {
        self.waypoints = v;
    }

    // Mutable pointer to the field.
    pub fn mut_waypoints(&mut self) -> &mut ::protobuf::RepeatedField<AerialPosition> {
        &mut self.waypoints
    }

    // Take field
    pub fn take_waypoints(&mut self) -> ::protobuf::RepeatedField<AerialPosition> {
        ::std::mem::replace(&mut self.waypoints, ::protobuf::RepeatedField::new())
    }

    pub fn get_waypoints(&self) -> &[AerialPosition] {
        &self.waypoints
    }

    fn get_waypoints_for_reflect(&self) -> &::protobuf::RepeatedField<AerialPosition> {
        &self.waypoints
    }

    fn mut_waypoints_for_reflect(&mut self) -> &mut ::protobuf::RepeatedField<AerialPosition> {
        &mut self.waypoints
    }

    // .interop.Position off_axis_pos = 7;

    pub fn clear_off_axis_pos(&mut self) {
        self.off_axis_pos.clear();
    }

    pub fn has_off_axis_pos(&self) -> bool {
        self.off_axis_pos.is_some()
    }

    // Param is passed by value, moved
    pub fn set_off_axis_pos(&mut self, v: Position) {
        self.off_axis_pos = ::protobuf::SingularPtrField::some(v);
    }

    // Mutable pointer to the field.
    // If field is not initialized, it is initialized with default value first.
    pub fn mut_off_axis_pos(&mut self) -> &mut Position {
        if self.off_axis_pos.is_none() {
            self.off_axis_pos.set_default();
        }
        self.off_axis_pos.as_mut().unwrap()
    }

    // Take field
    pub fn take_off_axis_pos(&mut self) -> Position {
        self.off_axis_pos.take().unwrap_or_else(|| Position::new())
    }

    pub fn get_off_axis_pos(&self) -> &Position {
        self.off_axis_pos.as_ref().unwrap_or_else(|| Position::default_instance())
    }

    fn get_off_axis_pos_for_reflect(&self) -> &::protobuf::SingularPtrField<Position> {
        &self.off_axis_pos
    }

    fn mut_off_axis_pos_for_reflect(&mut self) -> &mut ::protobuf::SingularPtrField<Position> {
        &mut self.off_axis_pos
    }

    // .interop.Position emergent_pos = 8;

    pub fn clear_emergent_pos(&mut self) {
        self.emergent_pos.clear();
    }

    pub fn has_emergent_pos(&self) -> bool {
        self.emergent_pos.is_some()
    }

    // Param is passed by value, moved
    pub fn set_emergent_pos(&mut self, v: Position) {
        self.emergent_pos = ::protobuf::SingularPtrField::some(v);
    }

    // Mutable pointer to the field.
    // If field is not initialized, it is initialized with default value first.
    pub fn mut_emergent_pos(&mut self) -> &mut Position {
        if self.emergent_pos.is_none() {
            self.emergent_pos.set_default();
        }
        self.emergent_pos.as_mut().unwrap()
    }

    // Take field
    pub fn take_emergent_pos(&mut self) -> Position {
        self.emergent_pos.take().unwrap_or_else(|| Position::new())
    }

    pub fn get_emergent_pos(&self) -> &Position {
        self.emergent_pos.as_ref().unwrap_or_else(|| Position::default_instance())
    }

    fn get_emergent_pos_for_reflect(&self) -> &::protobuf::SingularPtrField<Position> {
        &self.emergent_pos
    }

    fn mut_emergent_pos_for_reflect(&mut self) -> &mut ::protobuf::SingularPtrField<Position> {
        &mut self.emergent_pos
    }

    // repeated .interop.AerialPosition search_area = 9;

    pub fn clear_search_area(&mut self) {
        self.search_area.clear();
    }

    // Param is passed by value, moved
    pub fn set_search_area(&mut self, v: ::protobuf::RepeatedField<AerialPosition>) {
        self.search_area = v;
    }

    // Mutable pointer to the field.
    pub fn mut_search_area(&mut self) -> &mut ::protobuf::RepeatedField<AerialPosition> {
        &mut self.search_area
    }

    // Take field
    pub fn take_search_area(&mut self) -> ::protobuf::RepeatedField<AerialPosition> {
        ::std::mem::replace(&mut self.search_area, ::protobuf::RepeatedField::new())
    }

    pub fn get_search_area(&self) -> &[AerialPosition] {
        &self.search_area
    }

    fn get_search_area_for_reflect(&self) -> &::protobuf::RepeatedField<AerialPosition> {
        &self.search_area
    }

    fn mut_search_area_for_reflect(&mut self) -> &mut ::protobuf::RepeatedField<AerialPosition> {
        &mut self.search_area
    }
}

impl ::protobuf::Message for InteropMission {
    fn is_initialized(&self) -> bool {
        for v in &self.air_drop_pos {
            if !v.is_initialized() {
                return false;
            }
        };
        for v in &self.fly_zones {
            if !v.is_initialized() {
                return false;
            }
        };
        for v in &self.home_pos {
            if !v.is_initialized() {
                return false;
            }
        };
        for v in &self.waypoints {
            if !v.is_initialized() {
                return false;
            }
        };
        for v in &self.off_axis_pos {
            if !v.is_initialized() {
                return false;
            }
        };
        for v in &self.emergent_pos {
            if !v.is_initialized() {
                return false;
            }
        };
        for v in &self.search_area {
            if !v.is_initialized() {
                return false;
            }
        };
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream) -> ::protobuf::ProtobufResult<()> {
        while !is.eof()? {
            let (field_number, wire_type) = is.read_tag_unpack()?;
            match field_number {
                1 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.time = tmp;
                },
                2 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_bool()?;
                    self.current_mission = tmp;
                },
                3 => {
                    ::protobuf::rt::read_singular_message_into(wire_type, is, &mut self.air_drop_pos)?;
                },
                4 => {
                    ::protobuf::rt::read_repeated_message_into(wire_type, is, &mut self.fly_zones)?;
                },
                5 => {
                    ::protobuf::rt::read_singular_message_into(wire_type, is, &mut self.home_pos)?;
                },
                6 => {
                    ::protobuf::rt::read_repeated_message_into(wire_type, is, &mut self.waypoints)?;
                },
                7 => {
                    ::protobuf::rt::read_singular_message_into(wire_type, is, &mut self.off_axis_pos)?;
                },
                8 => {
                    ::protobuf::rt::read_singular_message_into(wire_type, is, &mut self.emergent_pos)?;
                },
                9 => {
                    ::protobuf::rt::read_repeated_message_into(wire_type, is, &mut self.search_area)?;
                },
                _ => {
                    ::protobuf::rt::read_unknown_or_skip_group(field_number, wire_type, is, self.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u32 {
        let mut my_size = 0;
        if self.time != 0. {
            my_size += 9;
        }
        if self.current_mission != false {
            my_size += 2;
        }
        if let Some(ref v) = self.air_drop_pos.as_ref() {
            let len = v.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        }
        for value in &self.fly_zones {
            let len = value.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        };
        if let Some(ref v) = self.home_pos.as_ref() {
            let len = v.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        }
        for value in &self.waypoints {
            let len = value.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        };
        if let Some(ref v) = self.off_axis_pos.as_ref() {
            let len = v.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        }
        if let Some(ref v) = self.emergent_pos.as_ref() {
            let len = v.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        }
        for value in &self.search_area {
            let len = value.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        };
        my_size += ::protobuf::rt::unknown_fields_size(self.get_unknown_fields());
        self.cached_size.set(my_size);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream) -> ::protobuf::ProtobufResult<()> {
        if self.time != 0. {
            os.write_double(1, self.time)?;
        }
        if self.current_mission != false {
            os.write_bool(2, self.current_mission)?;
        }
        if let Some(ref v) = self.air_drop_pos.as_ref() {
            os.write_tag(3, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        }
        for v in &self.fly_zones {
            os.write_tag(4, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        };
        if let Some(ref v) = self.home_pos.as_ref() {
            os.write_tag(5, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        }
        for v in &self.waypoints {
            os.write_tag(6, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        };
        if let Some(ref v) = self.off_axis_pos.as_ref() {
            os.write_tag(7, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        }
        if let Some(ref v) = self.emergent_pos.as_ref() {
            os.write_tag(8, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        }
        for v in &self.search_area {
            os.write_tag(9, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        };
        os.write_unknown_fields(self.get_unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn get_cached_size(&self) -> u32 {
        self.cached_size.get()
    }

    fn get_unknown_fields(&self) -> &::protobuf::UnknownFields {
        &self.unknown_fields
    }

    fn mut_unknown_fields(&mut self) -> &mut ::protobuf::UnknownFields {
        &mut self.unknown_fields
    }

    fn as_any(&self) -> &::std::any::Any {
        self as &::std::any::Any
    }
    fn as_any_mut(&mut self) -> &mut ::std::any::Any {
        self as &mut ::std::any::Any
    }
    fn into_any(self: Box<Self>) -> ::std::boxed::Box<::std::any::Any> {
        self
    }

    fn descriptor(&self) -> &'static ::protobuf::reflect::MessageDescriptor {
        ::protobuf::MessageStatic::descriptor_static(None::<Self>)
    }
}

impl ::protobuf::MessageStatic for InteropMission {
    fn new() -> InteropMission {
        InteropMission::new()
    }

    fn descriptor_static(_: ::std::option::Option<InteropMission>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "time",
                    InteropMission::get_time_for_reflect,
                    InteropMission::mut_time_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeBool>(
                    "current_mission",
                    InteropMission::get_current_mission_for_reflect,
                    InteropMission::mut_current_mission_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_singular_ptr_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<Position>>(
                    "air_drop_pos",
                    InteropMission::get_air_drop_pos_for_reflect,
                    InteropMission::mut_air_drop_pos_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_repeated_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<InteropMission_FlyZone>>(
                    "fly_zones",
                    InteropMission::get_fly_zones_for_reflect,
                    InteropMission::mut_fly_zones_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_singular_ptr_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<Position>>(
                    "home_pos",
                    InteropMission::get_home_pos_for_reflect,
                    InteropMission::mut_home_pos_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_repeated_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<AerialPosition>>(
                    "waypoints",
                    InteropMission::get_waypoints_for_reflect,
                    InteropMission::mut_waypoints_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_singular_ptr_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<Position>>(
                    "off_axis_pos",
                    InteropMission::get_off_axis_pos_for_reflect,
                    InteropMission::mut_off_axis_pos_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_singular_ptr_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<Position>>(
                    "emergent_pos",
                    InteropMission::get_emergent_pos_for_reflect,
                    InteropMission::mut_emergent_pos_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_repeated_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<AerialPosition>>(
                    "search_area",
                    InteropMission::get_search_area_for_reflect,
                    InteropMission::mut_search_area_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<InteropMission>(
                    "InteropMission",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for InteropMission {
    fn clear(&mut self) {
        self.clear_time();
        self.clear_current_mission();
        self.clear_air_drop_pos();
        self.clear_fly_zones();
        self.clear_home_pos();
        self.clear_waypoints();
        self.clear_off_axis_pos();
        self.clear_emergent_pos();
        self.clear_search_area();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for InteropMission {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for InteropMission {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

#[derive(PartialEq,Clone,Default)]
pub struct InteropMission_FlyZone {
    // message fields
    pub alt_msl_max: f64,
    pub alt_msl_min: f64,
    pub boundary: ::protobuf::RepeatedField<Position>,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for InteropMission_FlyZone {}

impl InteropMission_FlyZone {
    pub fn new() -> InteropMission_FlyZone {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static InteropMission_FlyZone {
        static mut instance: ::protobuf::lazy::Lazy<InteropMission_FlyZone> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const InteropMission_FlyZone,
        };
        unsafe {
            instance.get(InteropMission_FlyZone::new)
        }
    }

    // double alt_msl_max = 1;

    pub fn clear_alt_msl_max(&mut self) {
        self.alt_msl_max = 0.;
    }

    // Param is passed by value, moved
    pub fn set_alt_msl_max(&mut self, v: f64) {
        self.alt_msl_max = v;
    }

    pub fn get_alt_msl_max(&self) -> f64 {
        self.alt_msl_max
    }

    fn get_alt_msl_max_for_reflect(&self) -> &f64 {
        &self.alt_msl_max
    }

    fn mut_alt_msl_max_for_reflect(&mut self) -> &mut f64 {
        &mut self.alt_msl_max
    }

    // double alt_msl_min = 2;

    pub fn clear_alt_msl_min(&mut self) {
        self.alt_msl_min = 0.;
    }

    // Param is passed by value, moved
    pub fn set_alt_msl_min(&mut self, v: f64) {
        self.alt_msl_min = v;
    }

    pub fn get_alt_msl_min(&self) -> f64 {
        self.alt_msl_min
    }

    fn get_alt_msl_min_for_reflect(&self) -> &f64 {
        &self.alt_msl_min
    }

    fn mut_alt_msl_min_for_reflect(&mut self) -> &mut f64 {
        &mut self.alt_msl_min
    }

    // repeated .interop.Position boundary = 3;

    pub fn clear_boundary(&mut self) {
        self.boundary.clear();
    }

    // Param is passed by value, moved
    pub fn set_boundary(&mut self, v: ::protobuf::RepeatedField<Position>) {
        self.boundary = v;
    }

    // Mutable pointer to the field.
    pub fn mut_boundary(&mut self) -> &mut ::protobuf::RepeatedField<Position> {
        &mut self.boundary
    }

    // Take field
    pub fn take_boundary(&mut self) -> ::protobuf::RepeatedField<Position> {
        ::std::mem::replace(&mut self.boundary, ::protobuf::RepeatedField::new())
    }

    pub fn get_boundary(&self) -> &[Position] {
        &self.boundary
    }

    fn get_boundary_for_reflect(&self) -> &::protobuf::RepeatedField<Position> {
        &self.boundary
    }

    fn mut_boundary_for_reflect(&mut self) -> &mut ::protobuf::RepeatedField<Position> {
        &mut self.boundary
    }
}

impl ::protobuf::Message for InteropMission_FlyZone {
    fn is_initialized(&self) -> bool {
        for v in &self.boundary {
            if !v.is_initialized() {
                return false;
            }
        };
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream) -> ::protobuf::ProtobufResult<()> {
        while !is.eof()? {
            let (field_number, wire_type) = is.read_tag_unpack()?;
            match field_number {
                1 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.alt_msl_max = tmp;
                },
                2 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.alt_msl_min = tmp;
                },
                3 => {
                    ::protobuf::rt::read_repeated_message_into(wire_type, is, &mut self.boundary)?;
                },
                _ => {
                    ::protobuf::rt::read_unknown_or_skip_group(field_number, wire_type, is, self.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u32 {
        let mut my_size = 0;
        if self.alt_msl_max != 0. {
            my_size += 9;
        }
        if self.alt_msl_min != 0. {
            my_size += 9;
        }
        for value in &self.boundary {
            let len = value.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        };
        my_size += ::protobuf::rt::unknown_fields_size(self.get_unknown_fields());
        self.cached_size.set(my_size);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream) -> ::protobuf::ProtobufResult<()> {
        if self.alt_msl_max != 0. {
            os.write_double(1, self.alt_msl_max)?;
        }
        if self.alt_msl_min != 0. {
            os.write_double(2, self.alt_msl_min)?;
        }
        for v in &self.boundary {
            os.write_tag(3, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        };
        os.write_unknown_fields(self.get_unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn get_cached_size(&self) -> u32 {
        self.cached_size.get()
    }

    fn get_unknown_fields(&self) -> &::protobuf::UnknownFields {
        &self.unknown_fields
    }

    fn mut_unknown_fields(&mut self) -> &mut ::protobuf::UnknownFields {
        &mut self.unknown_fields
    }

    fn as_any(&self) -> &::std::any::Any {
        self as &::std::any::Any
    }
    fn as_any_mut(&mut self) -> &mut ::std::any::Any {
        self as &mut ::std::any::Any
    }
    fn into_any(self: Box<Self>) -> ::std::boxed::Box<::std::any::Any> {
        self
    }

    fn descriptor(&self) -> &'static ::protobuf::reflect::MessageDescriptor {
        ::protobuf::MessageStatic::descriptor_static(None::<Self>)
    }
}

impl ::protobuf::MessageStatic for InteropMission_FlyZone {
    fn new() -> InteropMission_FlyZone {
        InteropMission_FlyZone::new()
    }

    fn descriptor_static(_: ::std::option::Option<InteropMission_FlyZone>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "alt_msl_max",
                    InteropMission_FlyZone::get_alt_msl_max_for_reflect,
                    InteropMission_FlyZone::mut_alt_msl_max_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "alt_msl_min",
                    InteropMission_FlyZone::get_alt_msl_min_for_reflect,
                    InteropMission_FlyZone::mut_alt_msl_min_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_repeated_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<Position>>(
                    "boundary",
                    InteropMission_FlyZone::get_boundary_for_reflect,
                    InteropMission_FlyZone::mut_boundary_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<InteropMission_FlyZone>(
                    "InteropMission_FlyZone",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for InteropMission_FlyZone {
    fn clear(&mut self) {
        self.clear_alt_msl_max();
        self.clear_alt_msl_min();
        self.clear_boundary();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for InteropMission_FlyZone {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for InteropMission_FlyZone {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

#[derive(PartialEq,Clone,Default)]
pub struct Obstacles {
    // message fields
    pub time: f64,
    pub stationary: ::protobuf::RepeatedField<Obstacles_StationaryObstacle>,
    pub moving: ::protobuf::RepeatedField<Obstacles_MovingObstacle>,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for Obstacles {}

impl Obstacles {
    pub fn new() -> Obstacles {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static Obstacles {
        static mut instance: ::protobuf::lazy::Lazy<Obstacles> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const Obstacles,
        };
        unsafe {
            instance.get(Obstacles::new)
        }
    }

    // double time = 1;

    pub fn clear_time(&mut self) {
        self.time = 0.;
    }

    // Param is passed by value, moved
    pub fn set_time(&mut self, v: f64) {
        self.time = v;
    }

    pub fn get_time(&self) -> f64 {
        self.time
    }

    fn get_time_for_reflect(&self) -> &f64 {
        &self.time
    }

    fn mut_time_for_reflect(&mut self) -> &mut f64 {
        &mut self.time
    }

    // repeated .interop.Obstacles.StationaryObstacle stationary = 2;

    pub fn clear_stationary(&mut self) {
        self.stationary.clear();
    }

    // Param is passed by value, moved
    pub fn set_stationary(&mut self, v: ::protobuf::RepeatedField<Obstacles_StationaryObstacle>) {
        self.stationary = v;
    }

    // Mutable pointer to the field.
    pub fn mut_stationary(&mut self) -> &mut ::protobuf::RepeatedField<Obstacles_StationaryObstacle> {
        &mut self.stationary
    }

    // Take field
    pub fn take_stationary(&mut self) -> ::protobuf::RepeatedField<Obstacles_StationaryObstacle> {
        ::std::mem::replace(&mut self.stationary, ::protobuf::RepeatedField::new())
    }

    pub fn get_stationary(&self) -> &[Obstacles_StationaryObstacle] {
        &self.stationary
    }

    fn get_stationary_for_reflect(&self) -> &::protobuf::RepeatedField<Obstacles_StationaryObstacle> {
        &self.stationary
    }

    fn mut_stationary_for_reflect(&mut self) -> &mut ::protobuf::RepeatedField<Obstacles_StationaryObstacle> {
        &mut self.stationary
    }

    // repeated .interop.Obstacles.MovingObstacle moving = 3;

    pub fn clear_moving(&mut self) {
        self.moving.clear();
    }

    // Param is passed by value, moved
    pub fn set_moving(&mut self, v: ::protobuf::RepeatedField<Obstacles_MovingObstacle>) {
        self.moving = v;
    }

    // Mutable pointer to the field.
    pub fn mut_moving(&mut self) -> &mut ::protobuf::RepeatedField<Obstacles_MovingObstacle> {
        &mut self.moving
    }

    // Take field
    pub fn take_moving(&mut self) -> ::protobuf::RepeatedField<Obstacles_MovingObstacle> {
        ::std::mem::replace(&mut self.moving, ::protobuf::RepeatedField::new())
    }

    pub fn get_moving(&self) -> &[Obstacles_MovingObstacle] {
        &self.moving
    }

    fn get_moving_for_reflect(&self) -> &::protobuf::RepeatedField<Obstacles_MovingObstacle> {
        &self.moving
    }

    fn mut_moving_for_reflect(&mut self) -> &mut ::protobuf::RepeatedField<Obstacles_MovingObstacle> {
        &mut self.moving
    }
}

impl ::protobuf::Message for Obstacles {
    fn is_initialized(&self) -> bool {
        for v in &self.stationary {
            if !v.is_initialized() {
                return false;
            }
        };
        for v in &self.moving {
            if !v.is_initialized() {
                return false;
            }
        };
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream) -> ::protobuf::ProtobufResult<()> {
        while !is.eof()? {
            let (field_number, wire_type) = is.read_tag_unpack()?;
            match field_number {
                1 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.time = tmp;
                },
                2 => {
                    ::protobuf::rt::read_repeated_message_into(wire_type, is, &mut self.stationary)?;
                },
                3 => {
                    ::protobuf::rt::read_repeated_message_into(wire_type, is, &mut self.moving)?;
                },
                _ => {
                    ::protobuf::rt::read_unknown_or_skip_group(field_number, wire_type, is, self.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u32 {
        let mut my_size = 0;
        if self.time != 0. {
            my_size += 9;
        }
        for value in &self.stationary {
            let len = value.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        };
        for value in &self.moving {
            let len = value.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        };
        my_size += ::protobuf::rt::unknown_fields_size(self.get_unknown_fields());
        self.cached_size.set(my_size);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream) -> ::protobuf::ProtobufResult<()> {
        if self.time != 0. {
            os.write_double(1, self.time)?;
        }
        for v in &self.stationary {
            os.write_tag(2, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        };
        for v in &self.moving {
            os.write_tag(3, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        };
        os.write_unknown_fields(self.get_unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn get_cached_size(&self) -> u32 {
        self.cached_size.get()
    }

    fn get_unknown_fields(&self) -> &::protobuf::UnknownFields {
        &self.unknown_fields
    }

    fn mut_unknown_fields(&mut self) -> &mut ::protobuf::UnknownFields {
        &mut self.unknown_fields
    }

    fn as_any(&self) -> &::std::any::Any {
        self as &::std::any::Any
    }
    fn as_any_mut(&mut self) -> &mut ::std::any::Any {
        self as &mut ::std::any::Any
    }
    fn into_any(self: Box<Self>) -> ::std::boxed::Box<::std::any::Any> {
        self
    }

    fn descriptor(&self) -> &'static ::protobuf::reflect::MessageDescriptor {
        ::protobuf::MessageStatic::descriptor_static(None::<Self>)
    }
}

impl ::protobuf::MessageStatic for Obstacles {
    fn new() -> Obstacles {
        Obstacles::new()
    }

    fn descriptor_static(_: ::std::option::Option<Obstacles>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "time",
                    Obstacles::get_time_for_reflect,
                    Obstacles::mut_time_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_repeated_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<Obstacles_StationaryObstacle>>(
                    "stationary",
                    Obstacles::get_stationary_for_reflect,
                    Obstacles::mut_stationary_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_repeated_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<Obstacles_MovingObstacle>>(
                    "moving",
                    Obstacles::get_moving_for_reflect,
                    Obstacles::mut_moving_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<Obstacles>(
                    "Obstacles",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for Obstacles {
    fn clear(&mut self) {
        self.clear_time();
        self.clear_stationary();
        self.clear_moving();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for Obstacles {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for Obstacles {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

#[derive(PartialEq,Clone,Default)]
pub struct Obstacles_StationaryObstacle {
    // message fields
    pub pos: ::protobuf::SingularPtrField<AerialPosition>,
    pub height: f64,
    pub radius: f64,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for Obstacles_StationaryObstacle {}

impl Obstacles_StationaryObstacle {
    pub fn new() -> Obstacles_StationaryObstacle {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static Obstacles_StationaryObstacle {
        static mut instance: ::protobuf::lazy::Lazy<Obstacles_StationaryObstacle> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const Obstacles_StationaryObstacle,
        };
        unsafe {
            instance.get(Obstacles_StationaryObstacle::new)
        }
    }

    // .interop.AerialPosition pos = 1;

    pub fn clear_pos(&mut self) {
        self.pos.clear();
    }

    pub fn has_pos(&self) -> bool {
        self.pos.is_some()
    }

    // Param is passed by value, moved
    pub fn set_pos(&mut self, v: AerialPosition) {
        self.pos = ::protobuf::SingularPtrField::some(v);
    }

    // Mutable pointer to the field.
    // If field is not initialized, it is initialized with default value first.
    pub fn mut_pos(&mut self) -> &mut AerialPosition {
        if self.pos.is_none() {
            self.pos.set_default();
        }
        self.pos.as_mut().unwrap()
    }

    // Take field
    pub fn take_pos(&mut self) -> AerialPosition {
        self.pos.take().unwrap_or_else(|| AerialPosition::new())
    }

    pub fn get_pos(&self) -> &AerialPosition {
        self.pos.as_ref().unwrap_or_else(|| AerialPosition::default_instance())
    }

    fn get_pos_for_reflect(&self) -> &::protobuf::SingularPtrField<AerialPosition> {
        &self.pos
    }

    fn mut_pos_for_reflect(&mut self) -> &mut ::protobuf::SingularPtrField<AerialPosition> {
        &mut self.pos
    }

    // double height = 2;

    pub fn clear_height(&mut self) {
        self.height = 0.;
    }

    // Param is passed by value, moved
    pub fn set_height(&mut self, v: f64) {
        self.height = v;
    }

    pub fn get_height(&self) -> f64 {
        self.height
    }

    fn get_height_for_reflect(&self) -> &f64 {
        &self.height
    }

    fn mut_height_for_reflect(&mut self) -> &mut f64 {
        &mut self.height
    }

    // double radius = 3;

    pub fn clear_radius(&mut self) {
        self.radius = 0.;
    }

    // Param is passed by value, moved
    pub fn set_radius(&mut self, v: f64) {
        self.radius = v;
    }

    pub fn get_radius(&self) -> f64 {
        self.radius
    }

    fn get_radius_for_reflect(&self) -> &f64 {
        &self.radius
    }

    fn mut_radius_for_reflect(&mut self) -> &mut f64 {
        &mut self.radius
    }
}

impl ::protobuf::Message for Obstacles_StationaryObstacle {
    fn is_initialized(&self) -> bool {
        for v in &self.pos {
            if !v.is_initialized() {
                return false;
            }
        };
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream) -> ::protobuf::ProtobufResult<()> {
        while !is.eof()? {
            let (field_number, wire_type) = is.read_tag_unpack()?;
            match field_number {
                1 => {
                    ::protobuf::rt::read_singular_message_into(wire_type, is, &mut self.pos)?;
                },
                2 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.height = tmp;
                },
                3 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.radius = tmp;
                },
                _ => {
                    ::protobuf::rt::read_unknown_or_skip_group(field_number, wire_type, is, self.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u32 {
        let mut my_size = 0;
        if let Some(ref v) = self.pos.as_ref() {
            let len = v.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        }
        if self.height != 0. {
            my_size += 9;
        }
        if self.radius != 0. {
            my_size += 9;
        }
        my_size += ::protobuf::rt::unknown_fields_size(self.get_unknown_fields());
        self.cached_size.set(my_size);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream) -> ::protobuf::ProtobufResult<()> {
        if let Some(ref v) = self.pos.as_ref() {
            os.write_tag(1, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        }
        if self.height != 0. {
            os.write_double(2, self.height)?;
        }
        if self.radius != 0. {
            os.write_double(3, self.radius)?;
        }
        os.write_unknown_fields(self.get_unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn get_cached_size(&self) -> u32 {
        self.cached_size.get()
    }

    fn get_unknown_fields(&self) -> &::protobuf::UnknownFields {
        &self.unknown_fields
    }

    fn mut_unknown_fields(&mut self) -> &mut ::protobuf::UnknownFields {
        &mut self.unknown_fields
    }

    fn as_any(&self) -> &::std::any::Any {
        self as &::std::any::Any
    }
    fn as_any_mut(&mut self) -> &mut ::std::any::Any {
        self as &mut ::std::any::Any
    }
    fn into_any(self: Box<Self>) -> ::std::boxed::Box<::std::any::Any> {
        self
    }

    fn descriptor(&self) -> &'static ::protobuf::reflect::MessageDescriptor {
        ::protobuf::MessageStatic::descriptor_static(None::<Self>)
    }
}

impl ::protobuf::MessageStatic for Obstacles_StationaryObstacle {
    fn new() -> Obstacles_StationaryObstacle {
        Obstacles_StationaryObstacle::new()
    }

    fn descriptor_static(_: ::std::option::Option<Obstacles_StationaryObstacle>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_singular_ptr_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<AerialPosition>>(
                    "pos",
                    Obstacles_StationaryObstacle::get_pos_for_reflect,
                    Obstacles_StationaryObstacle::mut_pos_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "height",
                    Obstacles_StationaryObstacle::get_height_for_reflect,
                    Obstacles_StationaryObstacle::mut_height_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "radius",
                    Obstacles_StationaryObstacle::get_radius_for_reflect,
                    Obstacles_StationaryObstacle::mut_radius_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<Obstacles_StationaryObstacle>(
                    "Obstacles_StationaryObstacle",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for Obstacles_StationaryObstacle {
    fn clear(&mut self) {
        self.clear_pos();
        self.clear_height();
        self.clear_radius();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for Obstacles_StationaryObstacle {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for Obstacles_StationaryObstacle {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

#[derive(PartialEq,Clone,Default)]
pub struct Obstacles_MovingObstacle {
    // message fields
    pub pos: ::protobuf::SingularPtrField<Position>,
    pub radius: f64,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for Obstacles_MovingObstacle {}

impl Obstacles_MovingObstacle {
    pub fn new() -> Obstacles_MovingObstacle {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static Obstacles_MovingObstacle {
        static mut instance: ::protobuf::lazy::Lazy<Obstacles_MovingObstacle> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const Obstacles_MovingObstacle,
        };
        unsafe {
            instance.get(Obstacles_MovingObstacle::new)
        }
    }

    // .interop.Position pos = 1;

    pub fn clear_pos(&mut self) {
        self.pos.clear();
    }

    pub fn has_pos(&self) -> bool {
        self.pos.is_some()
    }

    // Param is passed by value, moved
    pub fn set_pos(&mut self, v: Position) {
        self.pos = ::protobuf::SingularPtrField::some(v);
    }

    // Mutable pointer to the field.
    // If field is not initialized, it is initialized with default value first.
    pub fn mut_pos(&mut self) -> &mut Position {
        if self.pos.is_none() {
            self.pos.set_default();
        }
        self.pos.as_mut().unwrap()
    }

    // Take field
    pub fn take_pos(&mut self) -> Position {
        self.pos.take().unwrap_or_else(|| Position::new())
    }

    pub fn get_pos(&self) -> &Position {
        self.pos.as_ref().unwrap_or_else(|| Position::default_instance())
    }

    fn get_pos_for_reflect(&self) -> &::protobuf::SingularPtrField<Position> {
        &self.pos
    }

    fn mut_pos_for_reflect(&mut self) -> &mut ::protobuf::SingularPtrField<Position> {
        &mut self.pos
    }

    // double radius = 2;

    pub fn clear_radius(&mut self) {
        self.radius = 0.;
    }

    // Param is passed by value, moved
    pub fn set_radius(&mut self, v: f64) {
        self.radius = v;
    }

    pub fn get_radius(&self) -> f64 {
        self.radius
    }

    fn get_radius_for_reflect(&self) -> &f64 {
        &self.radius
    }

    fn mut_radius_for_reflect(&mut self) -> &mut f64 {
        &mut self.radius
    }
}

impl ::protobuf::Message for Obstacles_MovingObstacle {
    fn is_initialized(&self) -> bool {
        for v in &self.pos {
            if !v.is_initialized() {
                return false;
            }
        };
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream) -> ::protobuf::ProtobufResult<()> {
        while !is.eof()? {
            let (field_number, wire_type) = is.read_tag_unpack()?;
            match field_number {
                1 => {
                    ::protobuf::rt::read_singular_message_into(wire_type, is, &mut self.pos)?;
                },
                2 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.radius = tmp;
                },
                _ => {
                    ::protobuf::rt::read_unknown_or_skip_group(field_number, wire_type, is, self.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u32 {
        let mut my_size = 0;
        if let Some(ref v) = self.pos.as_ref() {
            let len = v.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        }
        if self.radius != 0. {
            my_size += 9;
        }
        my_size += ::protobuf::rt::unknown_fields_size(self.get_unknown_fields());
        self.cached_size.set(my_size);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream) -> ::protobuf::ProtobufResult<()> {
        if let Some(ref v) = self.pos.as_ref() {
            os.write_tag(1, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        }
        if self.radius != 0. {
            os.write_double(2, self.radius)?;
        }
        os.write_unknown_fields(self.get_unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn get_cached_size(&self) -> u32 {
        self.cached_size.get()
    }

    fn get_unknown_fields(&self) -> &::protobuf::UnknownFields {
        &self.unknown_fields
    }

    fn mut_unknown_fields(&mut self) -> &mut ::protobuf::UnknownFields {
        &mut self.unknown_fields
    }

    fn as_any(&self) -> &::std::any::Any {
        self as &::std::any::Any
    }
    fn as_any_mut(&mut self) -> &mut ::std::any::Any {
        self as &mut ::std::any::Any
    }
    fn into_any(self: Box<Self>) -> ::std::boxed::Box<::std::any::Any> {
        self
    }

    fn descriptor(&self) -> &'static ::protobuf::reflect::MessageDescriptor {
        ::protobuf::MessageStatic::descriptor_static(None::<Self>)
    }
}

impl ::protobuf::MessageStatic for Obstacles_MovingObstacle {
    fn new() -> Obstacles_MovingObstacle {
        Obstacles_MovingObstacle::new()
    }

    fn descriptor_static(_: ::std::option::Option<Obstacles_MovingObstacle>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_singular_ptr_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<Position>>(
                    "pos",
                    Obstacles_MovingObstacle::get_pos_for_reflect,
                    Obstacles_MovingObstacle::mut_pos_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "radius",
                    Obstacles_MovingObstacle::get_radius_for_reflect,
                    Obstacles_MovingObstacle::mut_radius_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<Obstacles_MovingObstacle>(
                    "Obstacles_MovingObstacle",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for Obstacles_MovingObstacle {
    fn clear(&mut self) {
        self.clear_pos();
        self.clear_radius();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for Obstacles_MovingObstacle {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for Obstacles_MovingObstacle {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

#[derive(PartialEq,Clone,Default)]
pub struct InteropTelem {
    // message fields
    pub time: f64,
    pub pos: ::protobuf::SingularPtrField<AerialPosition>,
    pub yaw: f64,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for InteropTelem {}

impl InteropTelem {
    pub fn new() -> InteropTelem {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static InteropTelem {
        static mut instance: ::protobuf::lazy::Lazy<InteropTelem> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const InteropTelem,
        };
        unsafe {
            instance.get(InteropTelem::new)
        }
    }

    // double time = 1;

    pub fn clear_time(&mut self) {
        self.time = 0.;
    }

    // Param is passed by value, moved
    pub fn set_time(&mut self, v: f64) {
        self.time = v;
    }

    pub fn get_time(&self) -> f64 {
        self.time
    }

    fn get_time_for_reflect(&self) -> &f64 {
        &self.time
    }

    fn mut_time_for_reflect(&mut self) -> &mut f64 {
        &mut self.time
    }

    // .interop.AerialPosition pos = 2;

    pub fn clear_pos(&mut self) {
        self.pos.clear();
    }

    pub fn has_pos(&self) -> bool {
        self.pos.is_some()
    }

    // Param is passed by value, moved
    pub fn set_pos(&mut self, v: AerialPosition) {
        self.pos = ::protobuf::SingularPtrField::some(v);
    }

    // Mutable pointer to the field.
    // If field is not initialized, it is initialized with default value first.
    pub fn mut_pos(&mut self) -> &mut AerialPosition {
        if self.pos.is_none() {
            self.pos.set_default();
        }
        self.pos.as_mut().unwrap()
    }

    // Take field
    pub fn take_pos(&mut self) -> AerialPosition {
        self.pos.take().unwrap_or_else(|| AerialPosition::new())
    }

    pub fn get_pos(&self) -> &AerialPosition {
        self.pos.as_ref().unwrap_or_else(|| AerialPosition::default_instance())
    }

    fn get_pos_for_reflect(&self) -> &::protobuf::SingularPtrField<AerialPosition> {
        &self.pos
    }

    fn mut_pos_for_reflect(&mut self) -> &mut ::protobuf::SingularPtrField<AerialPosition> {
        &mut self.pos
    }

    // double yaw = 3;

    pub fn clear_yaw(&mut self) {
        self.yaw = 0.;
    }

    // Param is passed by value, moved
    pub fn set_yaw(&mut self, v: f64) {
        self.yaw = v;
    }

    pub fn get_yaw(&self) -> f64 {
        self.yaw
    }

    fn get_yaw_for_reflect(&self) -> &f64 {
        &self.yaw
    }

    fn mut_yaw_for_reflect(&mut self) -> &mut f64 {
        &mut self.yaw
    }
}

impl ::protobuf::Message for InteropTelem {
    fn is_initialized(&self) -> bool {
        for v in &self.pos {
            if !v.is_initialized() {
                return false;
            }
        };
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream) -> ::protobuf::ProtobufResult<()> {
        while !is.eof()? {
            let (field_number, wire_type) = is.read_tag_unpack()?;
            match field_number {
                1 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.time = tmp;
                },
                2 => {
                    ::protobuf::rt::read_singular_message_into(wire_type, is, &mut self.pos)?;
                },
                3 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.yaw = tmp;
                },
                _ => {
                    ::protobuf::rt::read_unknown_or_skip_group(field_number, wire_type, is, self.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u32 {
        let mut my_size = 0;
        if self.time != 0. {
            my_size += 9;
        }
        if let Some(ref v) = self.pos.as_ref() {
            let len = v.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        }
        if self.yaw != 0. {
            my_size += 9;
        }
        my_size += ::protobuf::rt::unknown_fields_size(self.get_unknown_fields());
        self.cached_size.set(my_size);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream) -> ::protobuf::ProtobufResult<()> {
        if self.time != 0. {
            os.write_double(1, self.time)?;
        }
        if let Some(ref v) = self.pos.as_ref() {
            os.write_tag(2, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        }
        if self.yaw != 0. {
            os.write_double(3, self.yaw)?;
        }
        os.write_unknown_fields(self.get_unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn get_cached_size(&self) -> u32 {
        self.cached_size.get()
    }

    fn get_unknown_fields(&self) -> &::protobuf::UnknownFields {
        &self.unknown_fields
    }

    fn mut_unknown_fields(&mut self) -> &mut ::protobuf::UnknownFields {
        &mut self.unknown_fields
    }

    fn as_any(&self) -> &::std::any::Any {
        self as &::std::any::Any
    }
    fn as_any_mut(&mut self) -> &mut ::std::any::Any {
        self as &mut ::std::any::Any
    }
    fn into_any(self: Box<Self>) -> ::std::boxed::Box<::std::any::Any> {
        self
    }

    fn descriptor(&self) -> &'static ::protobuf::reflect::MessageDescriptor {
        ::protobuf::MessageStatic::descriptor_static(None::<Self>)
    }
}

impl ::protobuf::MessageStatic for InteropTelem {
    fn new() -> InteropTelem {
        InteropTelem::new()
    }

    fn descriptor_static(_: ::std::option::Option<InteropTelem>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "time",
                    InteropTelem::get_time_for_reflect,
                    InteropTelem::mut_time_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_singular_ptr_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<AerialPosition>>(
                    "pos",
                    InteropTelem::get_pos_for_reflect,
                    InteropTelem::mut_pos_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "yaw",
                    InteropTelem::get_yaw_for_reflect,
                    InteropTelem::mut_yaw_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<InteropTelem>(
                    "InteropTelem",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for InteropTelem {
    fn clear(&mut self) {
        self.clear_time();
        self.clear_pos();
        self.clear_yaw();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for InteropTelem {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for InteropTelem {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

#[derive(PartialEq,Clone,Default)]
pub struct Odlc {
    // message fields
    pub time: f64,
    pub id: u32,
    pub field_type: Odlc_Type,
    pub pos: ::protobuf::SingularPtrField<Position>,
    pub orientation: Odlc_Orientation,
    pub shape: Odlc_Shape,
    pub background_color: Odlc_Color,
    pub alphanumeric: ::std::string::String,
    pub alphanumeric_color: Odlc_Color,
    pub description: ::std::string::String,
    pub autonomous: bool,
    pub image: ::std::vec::Vec<u8>,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for Odlc {}

impl Odlc {
    pub fn new() -> Odlc {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static Odlc {
        static mut instance: ::protobuf::lazy::Lazy<Odlc> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const Odlc,
        };
        unsafe {
            instance.get(Odlc::new)
        }
    }

    // double time = 1;

    pub fn clear_time(&mut self) {
        self.time = 0.;
    }

    // Param is passed by value, moved
    pub fn set_time(&mut self, v: f64) {
        self.time = v;
    }

    pub fn get_time(&self) -> f64 {
        self.time
    }

    fn get_time_for_reflect(&self) -> &f64 {
        &self.time
    }

    fn mut_time_for_reflect(&mut self) -> &mut f64 {
        &mut self.time
    }

    // uint32 id = 2;

    pub fn clear_id(&mut self) {
        self.id = 0;
    }

    // Param is passed by value, moved
    pub fn set_id(&mut self, v: u32) {
        self.id = v;
    }

    pub fn get_id(&self) -> u32 {
        self.id
    }

    fn get_id_for_reflect(&self) -> &u32 {
        &self.id
    }

    fn mut_id_for_reflect(&mut self) -> &mut u32 {
        &mut self.id
    }

    // .interop.Odlc.Type type = 3;

    pub fn clear_field_type(&mut self) {
        self.field_type = Odlc_Type::STANDARD;
    }

    // Param is passed by value, moved
    pub fn set_field_type(&mut self, v: Odlc_Type) {
        self.field_type = v;
    }

    pub fn get_field_type(&self) -> Odlc_Type {
        self.field_type
    }

    fn get_field_type_for_reflect(&self) -> &Odlc_Type {
        &self.field_type
    }

    fn mut_field_type_for_reflect(&mut self) -> &mut Odlc_Type {
        &mut self.field_type
    }

    // .interop.Position pos = 4;

    pub fn clear_pos(&mut self) {
        self.pos.clear();
    }

    pub fn has_pos(&self) -> bool {
        self.pos.is_some()
    }

    // Param is passed by value, moved
    pub fn set_pos(&mut self, v: Position) {
        self.pos = ::protobuf::SingularPtrField::some(v);
    }

    // Mutable pointer to the field.
    // If field is not initialized, it is initialized with default value first.
    pub fn mut_pos(&mut self) -> &mut Position {
        if self.pos.is_none() {
            self.pos.set_default();
        }
        self.pos.as_mut().unwrap()
    }

    // Take field
    pub fn take_pos(&mut self) -> Position {
        self.pos.take().unwrap_or_else(|| Position::new())
    }

    pub fn get_pos(&self) -> &Position {
        self.pos.as_ref().unwrap_or_else(|| Position::default_instance())
    }

    fn get_pos_for_reflect(&self) -> &::protobuf::SingularPtrField<Position> {
        &self.pos
    }

    fn mut_pos_for_reflect(&mut self) -> &mut ::protobuf::SingularPtrField<Position> {
        &mut self.pos
    }

    // .interop.Odlc.Orientation orientation = 5;

    pub fn clear_orientation(&mut self) {
        self.orientation = Odlc_Orientation::UNKNOWN_ORIENTATION;
    }

    // Param is passed by value, moved
    pub fn set_orientation(&mut self, v: Odlc_Orientation) {
        self.orientation = v;
    }

    pub fn get_orientation(&self) -> Odlc_Orientation {
        self.orientation
    }

    fn get_orientation_for_reflect(&self) -> &Odlc_Orientation {
        &self.orientation
    }

    fn mut_orientation_for_reflect(&mut self) -> &mut Odlc_Orientation {
        &mut self.orientation
    }

    // .interop.Odlc.Shape shape = 6;

    pub fn clear_shape(&mut self) {
        self.shape = Odlc_Shape::UNKNOWN_SHAPE;
    }

    // Param is passed by value, moved
    pub fn set_shape(&mut self, v: Odlc_Shape) {
        self.shape = v;
    }

    pub fn get_shape(&self) -> Odlc_Shape {
        self.shape
    }

    fn get_shape_for_reflect(&self) -> &Odlc_Shape {
        &self.shape
    }

    fn mut_shape_for_reflect(&mut self) -> &mut Odlc_Shape {
        &mut self.shape
    }

    // .interop.Odlc.Color background_color = 7;

    pub fn clear_background_color(&mut self) {
        self.background_color = Odlc_Color::UNKNOWN_COLOR;
    }

    // Param is passed by value, moved
    pub fn set_background_color(&mut self, v: Odlc_Color) {
        self.background_color = v;
    }

    pub fn get_background_color(&self) -> Odlc_Color {
        self.background_color
    }

    fn get_background_color_for_reflect(&self) -> &Odlc_Color {
        &self.background_color
    }

    fn mut_background_color_for_reflect(&mut self) -> &mut Odlc_Color {
        &mut self.background_color
    }

    // string alphanumeric = 8;

    pub fn clear_alphanumeric(&mut self) {
        self.alphanumeric.clear();
    }

    // Param is passed by value, moved
    pub fn set_alphanumeric(&mut self, v: ::std::string::String) {
        self.alphanumeric = v;
    }

    // Mutable pointer to the field.
    // If field is not initialized, it is initialized with default value first.
    pub fn mut_alphanumeric(&mut self) -> &mut ::std::string::String {
        &mut self.alphanumeric
    }

    // Take field
    pub fn take_alphanumeric(&mut self) -> ::std::string::String {
        ::std::mem::replace(&mut self.alphanumeric, ::std::string::String::new())
    }

    pub fn get_alphanumeric(&self) -> &str {
        &self.alphanumeric
    }

    fn get_alphanumeric_for_reflect(&self) -> &::std::string::String {
        &self.alphanumeric
    }

    fn mut_alphanumeric_for_reflect(&mut self) -> &mut ::std::string::String {
        &mut self.alphanumeric
    }

    // .interop.Odlc.Color alphanumeric_color = 9;

    pub fn clear_alphanumeric_color(&mut self) {
        self.alphanumeric_color = Odlc_Color::UNKNOWN_COLOR;
    }

    // Param is passed by value, moved
    pub fn set_alphanumeric_color(&mut self, v: Odlc_Color) {
        self.alphanumeric_color = v;
    }

    pub fn get_alphanumeric_color(&self) -> Odlc_Color {
        self.alphanumeric_color
    }

    fn get_alphanumeric_color_for_reflect(&self) -> &Odlc_Color {
        &self.alphanumeric_color
    }

    fn mut_alphanumeric_color_for_reflect(&mut self) -> &mut Odlc_Color {
        &mut self.alphanumeric_color
    }

    // string description = 10;

    pub fn clear_description(&mut self) {
        self.description.clear();
    }

    // Param is passed by value, moved
    pub fn set_description(&mut self, v: ::std::string::String) {
        self.description = v;
    }

    // Mutable pointer to the field.
    // If field is not initialized, it is initialized with default value first.
    pub fn mut_description(&mut self) -> &mut ::std::string::String {
        &mut self.description
    }

    // Take field
    pub fn take_description(&mut self) -> ::std::string::String {
        ::std::mem::replace(&mut self.description, ::std::string::String::new())
    }

    pub fn get_description(&self) -> &str {
        &self.description
    }

    fn get_description_for_reflect(&self) -> &::std::string::String {
        &self.description
    }

    fn mut_description_for_reflect(&mut self) -> &mut ::std::string::String {
        &mut self.description
    }

    // bool autonomous = 11;

    pub fn clear_autonomous(&mut self) {
        self.autonomous = false;
    }

    // Param is passed by value, moved
    pub fn set_autonomous(&mut self, v: bool) {
        self.autonomous = v;
    }

    pub fn get_autonomous(&self) -> bool {
        self.autonomous
    }

    fn get_autonomous_for_reflect(&self) -> &bool {
        &self.autonomous
    }

    fn mut_autonomous_for_reflect(&mut self) -> &mut bool {
        &mut self.autonomous
    }

    // bytes image = 12;

    pub fn clear_image(&mut self) {
        self.image.clear();
    }

    // Param is passed by value, moved
    pub fn set_image(&mut self, v: ::std::vec::Vec<u8>) {
        self.image = v;
    }

    // Mutable pointer to the field.
    // If field is not initialized, it is initialized with default value first.
    pub fn mut_image(&mut self) -> &mut ::std::vec::Vec<u8> {
        &mut self.image
    }

    // Take field
    pub fn take_image(&mut self) -> ::std::vec::Vec<u8> {
        ::std::mem::replace(&mut self.image, ::std::vec::Vec::new())
    }

    pub fn get_image(&self) -> &[u8] {
        &self.image
    }

    fn get_image_for_reflect(&self) -> &::std::vec::Vec<u8> {
        &self.image
    }

    fn mut_image_for_reflect(&mut self) -> &mut ::std::vec::Vec<u8> {
        &mut self.image
    }
}

impl ::protobuf::Message for Odlc {
    fn is_initialized(&self) -> bool {
        for v in &self.pos {
            if !v.is_initialized() {
                return false;
            }
        };
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream) -> ::protobuf::ProtobufResult<()> {
        while !is.eof()? {
            let (field_number, wire_type) = is.read_tag_unpack()?;
            match field_number {
                1 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.time = tmp;
                },
                2 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_uint32()?;
                    self.id = tmp;
                },
                3 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_enum()?;
                    self.field_type = tmp;
                },
                4 => {
                    ::protobuf::rt::read_singular_message_into(wire_type, is, &mut self.pos)?;
                },
                5 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_enum()?;
                    self.orientation = tmp;
                },
                6 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_enum()?;
                    self.shape = tmp;
                },
                7 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_enum()?;
                    self.background_color = tmp;
                },
                8 => {
                    ::protobuf::rt::read_singular_proto3_string_into(wire_type, is, &mut self.alphanumeric)?;
                },
                9 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_enum()?;
                    self.alphanumeric_color = tmp;
                },
                10 => {
                    ::protobuf::rt::read_singular_proto3_string_into(wire_type, is, &mut self.description)?;
                },
                11 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_bool()?;
                    self.autonomous = tmp;
                },
                12 => {
                    ::protobuf::rt::read_singular_proto3_bytes_into(wire_type, is, &mut self.image)?;
                },
                _ => {
                    ::protobuf::rt::read_unknown_or_skip_group(field_number, wire_type, is, self.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u32 {
        let mut my_size = 0;
        if self.time != 0. {
            my_size += 9;
        }
        if self.id != 0 {
            my_size += ::protobuf::rt::value_size(2, self.id, ::protobuf::wire_format::WireTypeVarint);
        }
        if self.field_type != Odlc_Type::STANDARD {
            my_size += ::protobuf::rt::enum_size(3, self.field_type);
        }
        if let Some(ref v) = self.pos.as_ref() {
            let len = v.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        }
        if self.orientation != Odlc_Orientation::UNKNOWN_ORIENTATION {
            my_size += ::protobuf::rt::enum_size(5, self.orientation);
        }
        if self.shape != Odlc_Shape::UNKNOWN_SHAPE {
            my_size += ::protobuf::rt::enum_size(6, self.shape);
        }
        if self.background_color != Odlc_Color::UNKNOWN_COLOR {
            my_size += ::protobuf::rt::enum_size(7, self.background_color);
        }
        if !self.alphanumeric.is_empty() {
            my_size += ::protobuf::rt::string_size(8, &self.alphanumeric);
        }
        if self.alphanumeric_color != Odlc_Color::UNKNOWN_COLOR {
            my_size += ::protobuf::rt::enum_size(9, self.alphanumeric_color);
        }
        if !self.description.is_empty() {
            my_size += ::protobuf::rt::string_size(10, &self.description);
        }
        if self.autonomous != false {
            my_size += 2;
        }
        if !self.image.is_empty() {
            my_size += ::protobuf::rt::bytes_size(12, &self.image);
        }
        my_size += ::protobuf::rt::unknown_fields_size(self.get_unknown_fields());
        self.cached_size.set(my_size);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream) -> ::protobuf::ProtobufResult<()> {
        if self.time != 0. {
            os.write_double(1, self.time)?;
        }
        if self.id != 0 {
            os.write_uint32(2, self.id)?;
        }
        if self.field_type != Odlc_Type::STANDARD {
            os.write_enum(3, self.field_type.value())?;
        }
        if let Some(ref v) = self.pos.as_ref() {
            os.write_tag(4, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        }
        if self.orientation != Odlc_Orientation::UNKNOWN_ORIENTATION {
            os.write_enum(5, self.orientation.value())?;
        }
        if self.shape != Odlc_Shape::UNKNOWN_SHAPE {
            os.write_enum(6, self.shape.value())?;
        }
        if self.background_color != Odlc_Color::UNKNOWN_COLOR {
            os.write_enum(7, self.background_color.value())?;
        }
        if !self.alphanumeric.is_empty() {
            os.write_string(8, &self.alphanumeric)?;
        }
        if self.alphanumeric_color != Odlc_Color::UNKNOWN_COLOR {
            os.write_enum(9, self.alphanumeric_color.value())?;
        }
        if !self.description.is_empty() {
            os.write_string(10, &self.description)?;
        }
        if self.autonomous != false {
            os.write_bool(11, self.autonomous)?;
        }
        if !self.image.is_empty() {
            os.write_bytes(12, &self.image)?;
        }
        os.write_unknown_fields(self.get_unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn get_cached_size(&self) -> u32 {
        self.cached_size.get()
    }

    fn get_unknown_fields(&self) -> &::protobuf::UnknownFields {
        &self.unknown_fields
    }

    fn mut_unknown_fields(&mut self) -> &mut ::protobuf::UnknownFields {
        &mut self.unknown_fields
    }

    fn as_any(&self) -> &::std::any::Any {
        self as &::std::any::Any
    }
    fn as_any_mut(&mut self) -> &mut ::std::any::Any {
        self as &mut ::std::any::Any
    }
    fn into_any(self: Box<Self>) -> ::std::boxed::Box<::std::any::Any> {
        self
    }

    fn descriptor(&self) -> &'static ::protobuf::reflect::MessageDescriptor {
        ::protobuf::MessageStatic::descriptor_static(None::<Self>)
    }
}

impl ::protobuf::MessageStatic for Odlc {
    fn new() -> Odlc {
        Odlc::new()
    }

    fn descriptor_static(_: ::std::option::Option<Odlc>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "time",
                    Odlc::get_time_for_reflect,
                    Odlc::mut_time_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeUint32>(
                    "id",
                    Odlc::get_id_for_reflect,
                    Odlc::mut_id_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeEnum<Odlc_Type>>(
                    "type",
                    Odlc::get_field_type_for_reflect,
                    Odlc::mut_field_type_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_singular_ptr_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<Position>>(
                    "pos",
                    Odlc::get_pos_for_reflect,
                    Odlc::mut_pos_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeEnum<Odlc_Orientation>>(
                    "orientation",
                    Odlc::get_orientation_for_reflect,
                    Odlc::mut_orientation_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeEnum<Odlc_Shape>>(
                    "shape",
                    Odlc::get_shape_for_reflect,
                    Odlc::mut_shape_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeEnum<Odlc_Color>>(
                    "background_color",
                    Odlc::get_background_color_for_reflect,
                    Odlc::mut_background_color_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeString>(
                    "alphanumeric",
                    Odlc::get_alphanumeric_for_reflect,
                    Odlc::mut_alphanumeric_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeEnum<Odlc_Color>>(
                    "alphanumeric_color",
                    Odlc::get_alphanumeric_color_for_reflect,
                    Odlc::mut_alphanumeric_color_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeString>(
                    "description",
                    Odlc::get_description_for_reflect,
                    Odlc::mut_description_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeBool>(
                    "autonomous",
                    Odlc::get_autonomous_for_reflect,
                    Odlc::mut_autonomous_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeBytes>(
                    "image",
                    Odlc::get_image_for_reflect,
                    Odlc::mut_image_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<Odlc>(
                    "Odlc",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for Odlc {
    fn clear(&mut self) {
        self.clear_time();
        self.clear_id();
        self.clear_field_type();
        self.clear_pos();
        self.clear_orientation();
        self.clear_shape();
        self.clear_background_color();
        self.clear_alphanumeric();
        self.clear_alphanumeric_color();
        self.clear_description();
        self.clear_autonomous();
        self.clear_image();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for Odlc {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for Odlc {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

#[derive(Clone,PartialEq,Eq,Debug,Hash)]
pub enum Odlc_Type {
    STANDARD = 0,
    OFF_AXIS = 1,
    EMERGENT = 2,
}

impl ::protobuf::ProtobufEnum for Odlc_Type {
    fn value(&self) -> i32 {
        *self as i32
    }

    fn from_i32(value: i32) -> ::std::option::Option<Odlc_Type> {
        match value {
            0 => ::std::option::Option::Some(Odlc_Type::STANDARD),
            1 => ::std::option::Option::Some(Odlc_Type::OFF_AXIS),
            2 => ::std::option::Option::Some(Odlc_Type::EMERGENT),
            _ => ::std::option::Option::None
        }
    }

    fn values() -> &'static [Self] {
        static values: &'static [Odlc_Type] = &[
            Odlc_Type::STANDARD,
            Odlc_Type::OFF_AXIS,
            Odlc_Type::EMERGENT,
        ];
        values
    }

    fn enum_descriptor_static(_: ::std::option::Option<Odlc_Type>) -> &'static ::protobuf::reflect::EnumDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::EnumDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::EnumDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                ::protobuf::reflect::EnumDescriptor::new("Odlc_Type", file_descriptor_proto())
            })
        }
    }
}

impl ::std::marker::Copy for Odlc_Type {
}

impl ::std::default::Default for Odlc_Type {
    fn default() -> Self {
        Odlc_Type::STANDARD
    }
}

impl ::protobuf::reflect::ProtobufValue for Odlc_Type {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Enum(self.descriptor())
    }
}

#[derive(Clone,PartialEq,Eq,Debug,Hash)]
pub enum Odlc_Orientation {
    UNKNOWN_ORIENTATION = 0,
    NORTH = 1,
    NORTHEAST = 2,
    EAST = 3,
    SOUTHEAST = 4,
    SOUTH = 5,
    SOUTHWEST = 6,
    WEST = 7,
    NORTHWEST = 8,
}

impl ::protobuf::ProtobufEnum for Odlc_Orientation {
    fn value(&self) -> i32 {
        *self as i32
    }

    fn from_i32(value: i32) -> ::std::option::Option<Odlc_Orientation> {
        match value {
            0 => ::std::option::Option::Some(Odlc_Orientation::UNKNOWN_ORIENTATION),
            1 => ::std::option::Option::Some(Odlc_Orientation::NORTH),
            2 => ::std::option::Option::Some(Odlc_Orientation::NORTHEAST),
            3 => ::std::option::Option::Some(Odlc_Orientation::EAST),
            4 => ::std::option::Option::Some(Odlc_Orientation::SOUTHEAST),
            5 => ::std::option::Option::Some(Odlc_Orientation::SOUTH),
            6 => ::std::option::Option::Some(Odlc_Orientation::SOUTHWEST),
            7 => ::std::option::Option::Some(Odlc_Orientation::WEST),
            8 => ::std::option::Option::Some(Odlc_Orientation::NORTHWEST),
            _ => ::std::option::Option::None
        }
    }

    fn values() -> &'static [Self] {
        static values: &'static [Odlc_Orientation] = &[
            Odlc_Orientation::UNKNOWN_ORIENTATION,
            Odlc_Orientation::NORTH,
            Odlc_Orientation::NORTHEAST,
            Odlc_Orientation::EAST,
            Odlc_Orientation::SOUTHEAST,
            Odlc_Orientation::SOUTH,
            Odlc_Orientation::SOUTHWEST,
            Odlc_Orientation::WEST,
            Odlc_Orientation::NORTHWEST,
        ];
        values
    }

    fn enum_descriptor_static(_: ::std::option::Option<Odlc_Orientation>) -> &'static ::protobuf::reflect::EnumDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::EnumDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::EnumDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                ::protobuf::reflect::EnumDescriptor::new("Odlc_Orientation", file_descriptor_proto())
            })
        }
    }
}

impl ::std::marker::Copy for Odlc_Orientation {
}

impl ::std::default::Default for Odlc_Orientation {
    fn default() -> Self {
        Odlc_Orientation::UNKNOWN_ORIENTATION
    }
}

impl ::protobuf::reflect::ProtobufValue for Odlc_Orientation {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Enum(self.descriptor())
    }
}

#[derive(Clone,PartialEq,Eq,Debug,Hash)]
pub enum Odlc_Shape {
    UNKNOWN_SHAPE = 0,
    CIRCLE = 1,
    SEMICIRCLE = 2,
    QUARTER_CIRCLE = 3,
    TRIANGLE = 4,
    SQUARE = 5,
    RECTANGLE = 6,
    TRAPEZOID = 7,
    PENTAGON = 8,
    HEXAGON = 9,
    HEPTAGON = 10,
    OCTAGON = 11,
    STAR = 12,
    CROSS = 13,
}

impl ::protobuf::ProtobufEnum for Odlc_Shape {
    fn value(&self) -> i32 {
        *self as i32
    }

    fn from_i32(value: i32) -> ::std::option::Option<Odlc_Shape> {
        match value {
            0 => ::std::option::Option::Some(Odlc_Shape::UNKNOWN_SHAPE),
            1 => ::std::option::Option::Some(Odlc_Shape::CIRCLE),
            2 => ::std::option::Option::Some(Odlc_Shape::SEMICIRCLE),
            3 => ::std::option::Option::Some(Odlc_Shape::QUARTER_CIRCLE),
            4 => ::std::option::Option::Some(Odlc_Shape::TRIANGLE),
            5 => ::std::option::Option::Some(Odlc_Shape::SQUARE),
            6 => ::std::option::Option::Some(Odlc_Shape::RECTANGLE),
            7 => ::std::option::Option::Some(Odlc_Shape::TRAPEZOID),
            8 => ::std::option::Option::Some(Odlc_Shape::PENTAGON),
            9 => ::std::option::Option::Some(Odlc_Shape::HEXAGON),
            10 => ::std::option::Option::Some(Odlc_Shape::HEPTAGON),
            11 => ::std::option::Option::Some(Odlc_Shape::OCTAGON),
            12 => ::std::option::Option::Some(Odlc_Shape::STAR),
            13 => ::std::option::Option::Some(Odlc_Shape::CROSS),
            _ => ::std::option::Option::None
        }
    }

    fn values() -> &'static [Self] {
        static values: &'static [Odlc_Shape] = &[
            Odlc_Shape::UNKNOWN_SHAPE,
            Odlc_Shape::CIRCLE,
            Odlc_Shape::SEMICIRCLE,
            Odlc_Shape::QUARTER_CIRCLE,
            Odlc_Shape::TRIANGLE,
            Odlc_Shape::SQUARE,
            Odlc_Shape::RECTANGLE,
            Odlc_Shape::TRAPEZOID,
            Odlc_Shape::PENTAGON,
            Odlc_Shape::HEXAGON,
            Odlc_Shape::HEPTAGON,
            Odlc_Shape::OCTAGON,
            Odlc_Shape::STAR,
            Odlc_Shape::CROSS,
        ];
        values
    }

    fn enum_descriptor_static(_: ::std::option::Option<Odlc_Shape>) -> &'static ::protobuf::reflect::EnumDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::EnumDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::EnumDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                ::protobuf::reflect::EnumDescriptor::new("Odlc_Shape", file_descriptor_proto())
            })
        }
    }
}

impl ::std::marker::Copy for Odlc_Shape {
}

impl ::std::default::Default for Odlc_Shape {
    fn default() -> Self {
        Odlc_Shape::UNKNOWN_SHAPE
    }
}

impl ::protobuf::reflect::ProtobufValue for Odlc_Shape {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Enum(self.descriptor())
    }
}

#[derive(Clone,PartialEq,Eq,Debug,Hash)]
pub enum Odlc_Color {
    UNKNOWN_COLOR = 0,
    WHITE = 1,
    BLACK = 2,
    GRAY = 3,
    RED = 4,
    BLUE = 5,
    GREEN = 6,
    YELLOW = 7,
    PURPLE = 8,
    BROWN = 9,
    ORANGE = 10,
}

impl ::protobuf::ProtobufEnum for Odlc_Color {
    fn value(&self) -> i32 {
        *self as i32
    }

    fn from_i32(value: i32) -> ::std::option::Option<Odlc_Color> {
        match value {
            0 => ::std::option::Option::Some(Odlc_Color::UNKNOWN_COLOR),
            1 => ::std::option::Option::Some(Odlc_Color::WHITE),
            2 => ::std::option::Option::Some(Odlc_Color::BLACK),
            3 => ::std::option::Option::Some(Odlc_Color::GRAY),
            4 => ::std::option::Option::Some(Odlc_Color::RED),
            5 => ::std::option::Option::Some(Odlc_Color::BLUE),
            6 => ::std::option::Option::Some(Odlc_Color::GREEN),
            7 => ::std::option::Option::Some(Odlc_Color::YELLOW),
            8 => ::std::option::Option::Some(Odlc_Color::PURPLE),
            9 => ::std::option::Option::Some(Odlc_Color::BROWN),
            10 => ::std::option::Option::Some(Odlc_Color::ORANGE),
            _ => ::std::option::Option::None
        }
    }

    fn values() -> &'static [Self] {
        static values: &'static [Odlc_Color] = &[
            Odlc_Color::UNKNOWN_COLOR,
            Odlc_Color::WHITE,
            Odlc_Color::BLACK,
            Odlc_Color::GRAY,
            Odlc_Color::RED,
            Odlc_Color::BLUE,
            Odlc_Color::GREEN,
            Odlc_Color::YELLOW,
            Odlc_Color::PURPLE,
            Odlc_Color::BROWN,
            Odlc_Color::ORANGE,
        ];
        values
    }

    fn enum_descriptor_static(_: ::std::option::Option<Odlc_Color>) -> &'static ::protobuf::reflect::EnumDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::EnumDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::EnumDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                ::protobuf::reflect::EnumDescriptor::new("Odlc_Color", file_descriptor_proto())
            })
        }
    }
}

impl ::std::marker::Copy for Odlc_Color {
}

impl ::std::default::Default for Odlc_Color {
    fn default() -> Self {
        Odlc_Color::UNKNOWN_COLOR
    }
}

impl ::protobuf::reflect::ProtobufValue for Odlc_Color {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Enum(self.descriptor())
    }
}

#[derive(PartialEq,Clone,Default)]
pub struct OdlcList {
    // message fields
    pub time: f64,
    pub list: ::protobuf::RepeatedField<Odlc>,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for OdlcList {}

impl OdlcList {
    pub fn new() -> OdlcList {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static OdlcList {
        static mut instance: ::protobuf::lazy::Lazy<OdlcList> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const OdlcList,
        };
        unsafe {
            instance.get(OdlcList::new)
        }
    }

    // double time = 1;

    pub fn clear_time(&mut self) {
        self.time = 0.;
    }

    // Param is passed by value, moved
    pub fn set_time(&mut self, v: f64) {
        self.time = v;
    }

    pub fn get_time(&self) -> f64 {
        self.time
    }

    fn get_time_for_reflect(&self) -> &f64 {
        &self.time
    }

    fn mut_time_for_reflect(&mut self) -> &mut f64 {
        &mut self.time
    }

    // repeated .interop.Odlc list = 2;

    pub fn clear_list(&mut self) {
        self.list.clear();
    }

    // Param is passed by value, moved
    pub fn set_list(&mut self, v: ::protobuf::RepeatedField<Odlc>) {
        self.list = v;
    }

    // Mutable pointer to the field.
    pub fn mut_list(&mut self) -> &mut ::protobuf::RepeatedField<Odlc> {
        &mut self.list
    }

    // Take field
    pub fn take_list(&mut self) -> ::protobuf::RepeatedField<Odlc> {
        ::std::mem::replace(&mut self.list, ::protobuf::RepeatedField::new())
    }

    pub fn get_list(&self) -> &[Odlc] {
        &self.list
    }

    fn get_list_for_reflect(&self) -> &::protobuf::RepeatedField<Odlc> {
        &self.list
    }

    fn mut_list_for_reflect(&mut self) -> &mut ::protobuf::RepeatedField<Odlc> {
        &mut self.list
    }
}

impl ::protobuf::Message for OdlcList {
    fn is_initialized(&self) -> bool {
        for v in &self.list {
            if !v.is_initialized() {
                return false;
            }
        };
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream) -> ::protobuf::ProtobufResult<()> {
        while !is.eof()? {
            let (field_number, wire_type) = is.read_tag_unpack()?;
            match field_number {
                1 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.time = tmp;
                },
                2 => {
                    ::protobuf::rt::read_repeated_message_into(wire_type, is, &mut self.list)?;
                },
                _ => {
                    ::protobuf::rt::read_unknown_or_skip_group(field_number, wire_type, is, self.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u32 {
        let mut my_size = 0;
        if self.time != 0. {
            my_size += 9;
        }
        for value in &self.list {
            let len = value.compute_size();
            my_size += 1 + ::protobuf::rt::compute_raw_varint32_size(len) + len;
        };
        my_size += ::protobuf::rt::unknown_fields_size(self.get_unknown_fields());
        self.cached_size.set(my_size);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream) -> ::protobuf::ProtobufResult<()> {
        if self.time != 0. {
            os.write_double(1, self.time)?;
        }
        for v in &self.list {
            os.write_tag(2, ::protobuf::wire_format::WireTypeLengthDelimited)?;
            os.write_raw_varint32(v.get_cached_size())?;
            v.write_to_with_cached_sizes(os)?;
        };
        os.write_unknown_fields(self.get_unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn get_cached_size(&self) -> u32 {
        self.cached_size.get()
    }

    fn get_unknown_fields(&self) -> &::protobuf::UnknownFields {
        &self.unknown_fields
    }

    fn mut_unknown_fields(&mut self) -> &mut ::protobuf::UnknownFields {
        &mut self.unknown_fields
    }

    fn as_any(&self) -> &::std::any::Any {
        self as &::std::any::Any
    }
    fn as_any_mut(&mut self) -> &mut ::std::any::Any {
        self as &mut ::std::any::Any
    }
    fn into_any(self: Box<Self>) -> ::std::boxed::Box<::std::any::Any> {
        self
    }

    fn descriptor(&self) -> &'static ::protobuf::reflect::MessageDescriptor {
        ::protobuf::MessageStatic::descriptor_static(None::<Self>)
    }
}

impl ::protobuf::MessageStatic for OdlcList {
    fn new() -> OdlcList {
        OdlcList::new()
    }

    fn descriptor_static(_: ::std::option::Option<OdlcList>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "time",
                    OdlcList::get_time_for_reflect,
                    OdlcList::mut_time_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_repeated_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<Odlc>>(
                    "list",
                    OdlcList::get_list_for_reflect,
                    OdlcList::mut_list_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<OdlcList>(
                    "OdlcList",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for OdlcList {
    fn clear(&mut self) {
        self.clear_time();
        self.clear_list();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for OdlcList {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for OdlcList {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

#[derive(PartialEq,Clone,Default)]
pub struct InteropMessage {
    // message fields
    pub time: f64,
    pub text: ::std::string::String,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for InteropMessage {}

impl InteropMessage {
    pub fn new() -> InteropMessage {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static InteropMessage {
        static mut instance: ::protobuf::lazy::Lazy<InteropMessage> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const InteropMessage,
        };
        unsafe {
            instance.get(InteropMessage::new)
        }
    }

    // double time = 1;

    pub fn clear_time(&mut self) {
        self.time = 0.;
    }

    // Param is passed by value, moved
    pub fn set_time(&mut self, v: f64) {
        self.time = v;
    }

    pub fn get_time(&self) -> f64 {
        self.time
    }

    fn get_time_for_reflect(&self) -> &f64 {
        &self.time
    }

    fn mut_time_for_reflect(&mut self) -> &mut f64 {
        &mut self.time
    }

    // string text = 2;

    pub fn clear_text(&mut self) {
        self.text.clear();
    }

    // Param is passed by value, moved
    pub fn set_text(&mut self, v: ::std::string::String) {
        self.text = v;
    }

    // Mutable pointer to the field.
    // If field is not initialized, it is initialized with default value first.
    pub fn mut_text(&mut self) -> &mut ::std::string::String {
        &mut self.text
    }

    // Take field
    pub fn take_text(&mut self) -> ::std::string::String {
        ::std::mem::replace(&mut self.text, ::std::string::String::new())
    }

    pub fn get_text(&self) -> &str {
        &self.text
    }

    fn get_text_for_reflect(&self) -> &::std::string::String {
        &self.text
    }

    fn mut_text_for_reflect(&mut self) -> &mut ::std::string::String {
        &mut self.text
    }
}

impl ::protobuf::Message for InteropMessage {
    fn is_initialized(&self) -> bool {
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream) -> ::protobuf::ProtobufResult<()> {
        while !is.eof()? {
            let (field_number, wire_type) = is.read_tag_unpack()?;
            match field_number {
                1 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.time = tmp;
                },
                2 => {
                    ::protobuf::rt::read_singular_proto3_string_into(wire_type, is, &mut self.text)?;
                },
                _ => {
                    ::protobuf::rt::read_unknown_or_skip_group(field_number, wire_type, is, self.mut_unknown_fields())?;
                },
            };
        }
        ::std::result::Result::Ok(())
    }

    // Compute sizes of nested messages
    #[allow(unused_variables)]
    fn compute_size(&self) -> u32 {
        let mut my_size = 0;
        if self.time != 0. {
            my_size += 9;
        }
        if !self.text.is_empty() {
            my_size += ::protobuf::rt::string_size(2, &self.text);
        }
        my_size += ::protobuf::rt::unknown_fields_size(self.get_unknown_fields());
        self.cached_size.set(my_size);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream) -> ::protobuf::ProtobufResult<()> {
        if self.time != 0. {
            os.write_double(1, self.time)?;
        }
        if !self.text.is_empty() {
            os.write_string(2, &self.text)?;
        }
        os.write_unknown_fields(self.get_unknown_fields())?;
        ::std::result::Result::Ok(())
    }

    fn get_cached_size(&self) -> u32 {
        self.cached_size.get()
    }

    fn get_unknown_fields(&self) -> &::protobuf::UnknownFields {
        &self.unknown_fields
    }

    fn mut_unknown_fields(&mut self) -> &mut ::protobuf::UnknownFields {
        &mut self.unknown_fields
    }

    fn as_any(&self) -> &::std::any::Any {
        self as &::std::any::Any
    }
    fn as_any_mut(&mut self) -> &mut ::std::any::Any {
        self as &mut ::std::any::Any
    }
    fn into_any(self: Box<Self>) -> ::std::boxed::Box<::std::any::Any> {
        self
    }

    fn descriptor(&self) -> &'static ::protobuf::reflect::MessageDescriptor {
        ::protobuf::MessageStatic::descriptor_static(None::<Self>)
    }
}

impl ::protobuf::MessageStatic for InteropMessage {
    fn new() -> InteropMessage {
        InteropMessage::new()
    }

    fn descriptor_static(_: ::std::option::Option<InteropMessage>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "time",
                    InteropMessage::get_time_for_reflect,
                    InteropMessage::mut_time_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeString>(
                    "text",
                    InteropMessage::get_text_for_reflect,
                    InteropMessage::mut_text_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<InteropMessage>(
                    "InteropMessage",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for InteropMessage {
    fn clear(&mut self) {
        self.clear_time();
        self.clear_text();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for InteropMessage {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for InteropMessage {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

static file_descriptor_proto_data: &'static [u8] = b"\
    \n\rinterop.proto\x12\x07interop\".\n\x08Position\x12\x10\n\x03lat\x18\
    \x01\x20\x01(\x01R\x03lat\x12\x10\n\x03lon\x18\x02\x20\x01(\x01R\x03lon\
    \"M\n\x0eAerialPosition\x12\x10\n\x03lat\x18\x01\x20\x01(\x01R\x03lat\
    \x12\x10\n\x03lon\x18\x02\x20\x01(\x01R\x03lon\x12\x17\n\x07alt_msl\x18\
    \x03\x20\x01(\x01R\x06altMsl\"\xc4\x04\n\x0eInteropMission\x12\x12\n\x04\
    time\x18\x01\x20\x01(\x01R\x04time\x12'\n\x0fcurrent_mission\x18\x02\x20\
    \x01(\x08R\x0ecurrentMission\x123\n\x0cair_drop_pos\x18\x03\x20\x01(\x0b\
    2\x11.interop.PositionR\nairDropPos\x12<\n\tfly_zones\x18\x04\x20\x03(\
    \x0b2\x1f.interop.InteropMission.FlyZoneR\x08flyZones\x12,\n\x08home_pos\
    \x18\x05\x20\x01(\x0b2\x11.interop.PositionR\x07homePos\x125\n\twaypoint\
    s\x18\x06\x20\x03(\x0b2\x17.interop.AerialPositionR\twaypoints\x123\n\
    \x0coff_axis_pos\x18\x07\x20\x01(\x0b2\x11.interop.PositionR\noffAxisPos\
    \x124\n\x0cemergent_pos\x18\x08\x20\x01(\x0b2\x11.interop.PositionR\x0be\
    mergentPos\x128\n\x0bsearch_area\x18\t\x20\x03(\x0b2\x17.interop.AerialP\
    ositionR\nsearchArea\x1ax\n\x07FlyZone\x12\x1e\n\x0balt_msl_max\x18\x01\
    \x20\x01(\x01R\taltMslMax\x12\x1e\n\x0balt_msl_min\x18\x02\x20\x01(\x01R\
    \taltMslMin\x12-\n\x08boundary\x18\x03\x20\x03(\x0b2\x11.interop.Positio\
    nR\x08boundary\"\xe1\x02\n\tObstacles\x12\x12\n\x04time\x18\x01\x20\x01(\
    \x01R\x04time\x12E\n\nstationary\x18\x02\x20\x03(\x0b2%.interop.Obstacle\
    s.StationaryObstacleR\nstationary\x129\n\x06moving\x18\x03\x20\x03(\x0b2\
    !.interop.Obstacles.MovingObstacleR\x06moving\x1ao\n\x12StationaryObstac\
    le\x12)\n\x03pos\x18\x01\x20\x01(\x0b2\x17.interop.AerialPositionR\x03po\
    s\x12\x16\n\x06height\x18\x02\x20\x01(\x01R\x06height\x12\x16\n\x06radiu\
    s\x18\x03\x20\x01(\x01R\x06radius\x1aM\n\x0eMovingObstacle\x12#\n\x03pos\
    \x18\x01\x20\x01(\x0b2\x11.interop.PositionR\x03pos\x12\x16\n\x06radius\
    \x18\x02\x20\x01(\x01R\x06radius\"_\n\x0cInteropTelem\x12\x12\n\x04time\
    \x18\x01\x20\x01(\x01R\x04time\x12)\n\x03pos\x18\x02\x20\x01(\x0b2\x17.i\
    nterop.AerialPositionR\x03pos\x12\x10\n\x03yaw\x18\x03\x20\x01(\x01R\x03\
    yaw\"\xfa\x07\n\x04Odlc\x12\x12\n\x04time\x18\x01\x20\x01(\x01R\x04time\
    \x12\x0e\n\x02id\x18\x02\x20\x01(\rR\x02id\x12&\n\x04type\x18\x03\x20\
    \x01(\x0e2\x12.interop.Odlc.TypeR\x04type\x12#\n\x03pos\x18\x04\x20\x01(\
    \x0b2\x11.interop.PositionR\x03pos\x12;\n\x0borientation\x18\x05\x20\x01\
    (\x0e2\x19.interop.Odlc.OrientationR\x0borientation\x12)\n\x05shape\x18\
    \x06\x20\x01(\x0e2\x13.interop.Odlc.ShapeR\x05shape\x12>\n\x10background\
    _color\x18\x07\x20\x01(\x0e2\x13.interop.Odlc.ColorR\x0fbackgroundColor\
    \x12\"\n\x0calphanumeric\x18\x08\x20\x01(\tR\x0calphanumeric\x12B\n\x12a\
    lphanumeric_color\x18\t\x20\x01(\x0e2\x13.interop.Odlc.ColorR\x11alphanu\
    mericColor\x12\x20\n\x0bdescription\x18\n\x20\x01(\tR\x0bdescription\x12\
    \x1e\n\nautonomous\x18\x0b\x20\x01(\x08R\nautonomous\x12\x14\n\x05image\
    \x18\x0c\x20\x01(\x0cR\x05image\"0\n\x04Type\x12\x0c\n\x08STANDARD\x10\0\
    \x12\x0c\n\x08OFF_AXIS\x10\x01\x12\x0c\n\x08EMERGENT\x10\x02\"\x8c\x01\n\
    \x0bOrientation\x12\x17\n\x13UNKNOWN_ORIENTATION\x10\0\x12\t\n\x05NORTH\
    \x10\x01\x12\r\n\tNORTHEAST\x10\x02\x12\x08\n\x04EAST\x10\x03\x12\r\n\tS\
    OUTHEAST\x10\x04\x12\t\n\x05SOUTH\x10\x05\x12\r\n\tSOUTHWEST\x10\x06\x12\
    \x08\n\x04WEST\x10\x07\x12\r\n\tNORTHWEST\x10\x08\"\xcd\x01\n\x05Shape\
    \x12\x11\n\rUNKNOWN_SHAPE\x10\0\x12\n\n\x06CIRCLE\x10\x01\x12\x0e\n\nSEM\
    ICIRCLE\x10\x02\x12\x12\n\x0eQUARTER_CIRCLE\x10\x03\x12\x0c\n\x08TRIANGL\
    E\x10\x04\x12\n\n\x06SQUARE\x10\x05\x12\r\n\tRECTANGLE\x10\x06\x12\r\n\t\
    TRAPEZOID\x10\x07\x12\x0c\n\x08PENTAGON\x10\x08\x12\x0b\n\x07HEXAGON\x10\
    \t\x12\x0c\n\x08HEPTAGON\x10\n\x12\x0b\n\x07OCTAGON\x10\x0b\x12\x08\n\
    \x04STAR\x10\x0c\x12\t\n\x05CROSS\x10\r\"\x87\x01\n\x05Color\x12\x11\n\r\
    UNKNOWN_COLOR\x10\0\x12\t\n\x05WHITE\x10\x01\x12\t\n\x05BLACK\x10\x02\
    \x12\x08\n\x04GRAY\x10\x03\x12\x07\n\x03RED\x10\x04\x12\x08\n\x04BLUE\
    \x10\x05\x12\t\n\x05GREEN\x10\x06\x12\n\n\x06YELLOW\x10\x07\x12\n\n\x06P\
    URPLE\x10\x08\x12\t\n\x05BROWN\x10\t\x12\n\n\x06ORANGE\x10\n\"A\n\x08Odl\
    cList\x12\x12\n\x04time\x18\x01\x20\x01(\x01R\x04time\x12!\n\x04list\x18\
    \x02\x20\x03(\x0b2\r.interop.OdlcR\x04list\"8\n\x0eInteropMessage\x12\
    \x12\n\x04time\x18\x01\x20\x01(\x01R\x04time\x12\x12\n\x04text\x18\x02\
    \x20\x01(\tR\x04textJ\xdd1\n\x07\x12\x05\x0f\0\x9d\x01\x01\n\x8e\x03\n\
    \x01\x0c\x12\x03\x0f\0\x122\x83\x03\n\x20Interop\x20server\x20message\
    \x20definitions.\n\n\x20The\x20Interop\x20Proxy\x20service\x20translates\
    \x20the\x20JSON\x20repsonses\x20from\x20the\n\x20interop\x20server\x20in\
    to\x20these\x20messages\x20(and\x20vise-versa).\n\n\x20Note\x20that\x20a\
    ll\x20units\x20will\x20be\x20in\x20meters,\x20meters/second,\x20seconds,\
    \n\x20degrees,\x20etc.\x20unless\x20otherwise\x20noted.\n\n\x20Time\x20i\
    s\x20in\x20seconds\x20from\x201970\x20epoch.\n\n\x20Yaw\x20is\x20in\x20t\
    he\x20range\x20[0,\x20360)\x20degrees\x20and\x20lat\x20and\x20lon\x20are\
    \x20in\x20the\n\x20range\x20(-180,\x20180].\n\n\x08\n\x01\x02\x12\x03\
    \x11\x08\x0f\n%\n\x02\x04\0\x12\x04\x14\0\x17\x01\x1a\x19\x20Used\x20by\
    \x20other\x20messages.\n\n\n\n\x03\x04\0\x01\x12\x03\x14\x08\x10\n\x0b\n\
    \x04\x04\0\x02\0\x12\x03\x15\x04\x13\n\r\n\x05\x04\0\x02\0\x04\x12\x04\
    \x15\x04\x14\x12\n\x0c\n\x05\x04\0\x02\0\x05\x12\x03\x15\x04\n\n\x0c\n\
    \x05\x04\0\x02\0\x01\x12\x03\x15\x0b\x0e\n\x0c\n\x05\x04\0\x02\0\x03\x12\
    \x03\x15\x11\x12\n\x0b\n\x04\x04\0\x02\x01\x12\x03\x16\x04\x13\n\r\n\x05\
    \x04\0\x02\x01\x04\x12\x04\x16\x04\x15\x13\n\x0c\n\x05\x04\0\x02\x01\x05\
    \x12\x03\x16\x04\n\n\x0c\n\x05\x04\0\x02\x01\x01\x12\x03\x16\x0b\x0e\n\
    \x0c\n\x05\x04\0\x02\x01\x03\x12\x03\x16\x11\x12\n%\n\x02\x04\x01\x12\
    \x04\x1a\0\x1e\x01\x1a\x19\x20Used\x20by\x20other\x20messages.\n\n\n\n\
    \x03\x04\x01\x01\x12\x03\x1a\x08\x16\n\x0b\n\x04\x04\x01\x02\0\x12\x03\
    \x1b\x04\x13\n\r\n\x05\x04\x01\x02\0\x04\x12\x04\x1b\x04\x1a\x18\n\x0c\n\
    \x05\x04\x01\x02\0\x05\x12\x03\x1b\x04\n\n\x0c\n\x05\x04\x01\x02\0\x01\
    \x12\x03\x1b\x0b\x0e\n\x0c\n\x05\x04\x01\x02\0\x03\x12\x03\x1b\x11\x12\n\
    \x0b\n\x04\x04\x01\x02\x01\x12\x03\x1c\x04\x13\n\r\n\x05\x04\x01\x02\x01\
    \x04\x12\x04\x1c\x04\x1b\x13\n\x0c\n\x05\x04\x01\x02\x01\x05\x12\x03\x1c\
    \x04\n\n\x0c\n\x05\x04\x01\x02\x01\x01\x12\x03\x1c\x0b\x0e\n\x0c\n\x05\
    \x04\x01\x02\x01\x03\x12\x03\x1c\x11\x12\n\x0b\n\x04\x04\x01\x02\x02\x12\
    \x03\x1d\x04\x17\n\r\n\x05\x04\x01\x02\x02\x04\x12\x04\x1d\x04\x1c\x13\n\
    \x0c\n\x05\x04\x01\x02\x02\x05\x12\x03\x1d\x04\n\n\x0c\n\x05\x04\x01\x02\
    \x02\x01\x12\x03\x1d\x0b\x12\n\x0c\n\x05\x04\x01\x02\x02\x03\x12\x03\x1d\
    \x15\x16\n\x97\x01\n\x02\x04\x02\x12\x04$\05\x01\x1a\x8a\x01\x20Mission\
    \x20on\x20the\x20interop\x20server.\n\x20\n\x20Note\x20the\x20lack\x20of\
    \x20an\x20active\x20field,\x20as\x20all\x20missions\x20passed\x20into\
    \x20the\n\x20stack\x20will\x20be\x20assumed\x20to\x20be\x20active.\n\n\n\
    \n\x03\x04\x02\x01\x12\x03$\x08\x16\n\x0c\n\x04\x04\x02\x03\0\x12\x04%\
    \x04)\x05\n\x0c\n\x05\x04\x02\x03\0\x01\x12\x03%\x0c\x13\n\r\n\x06\x04\
    \x02\x03\0\x02\0\x12\x03&\x08\x1f\n\x0f\n\x07\x04\x02\x03\0\x02\0\x04\
    \x12\x04&\x08%\x15\n\x0e\n\x07\x04\x02\x03\0\x02\0\x05\x12\x03&\x08\x0e\
    \n\x0e\n\x07\x04\x02\x03\0\x02\0\x01\x12\x03&\x0f\x1a\n\x0e\n\x07\x04\
    \x02\x03\0\x02\0\x03\x12\x03&\x1d\x1e\n\r\n\x06\x04\x02\x03\0\x02\x01\
    \x12\x03'\x08\x1f\n\x0f\n\x07\x04\x02\x03\0\x02\x01\x04\x12\x04'\x08&\
    \x1f\n\x0e\n\x07\x04\x02\x03\0\x02\x01\x05\x12\x03'\x08\x0e\n\x0e\n\x07\
    \x04\x02\x03\0\x02\x01\x01\x12\x03'\x0f\x1a\n\x0e\n\x07\x04\x02\x03\0\
    \x02\x01\x03\x12\x03'\x1d\x1e\n\r\n\x06\x04\x02\x03\0\x02\x02\x12\x03(\
    \x08'\n\x0e\n\x07\x04\x02\x03\0\x02\x02\x04\x12\x03(\x08\x10\n\x0e\n\x07\
    \x04\x02\x03\0\x02\x02\x06\x12\x03(\x11\x19\n\x0e\n\x07\x04\x02\x03\0\
    \x02\x02\x01\x12\x03(\x1a\"\n\x0e\n\x07\x04\x02\x03\0\x02\x02\x03\x12\
    \x03(%&\n\x0b\n\x04\x04\x02\x02\0\x12\x03+\x04\x14\n\r\n\x05\x04\x02\x02\
    \0\x04\x12\x04+\x04)\x05\n\x0c\n\x05\x04\x02\x02\0\x05\x12\x03+\x04\n\n\
    \x0c\n\x05\x04\x02\x02\0\x01\x12\x03+\x0b\x0f\n\x0c\n\x05\x04\x02\x02\0\
    \x03\x12\x03+\x12\x13\n9\n\x04\x04\x02\x02\x01\x12\x03-\x04\x1d\x1a,\x20\
    If\x20there\x20even\x20is\x20an\x20active\x20mission\x20or\x20not.\n\n\r\
    \n\x05\x04\x02\x02\x01\x04\x12\x04-\x04+\x14\n\x0c\n\x05\x04\x02\x02\x01\
    \x05\x12\x03-\x04\x08\n\x0c\n\x05\x04\x02\x02\x01\x01\x12\x03-\t\x18\n\
    \x0c\n\x05\x04\x02\x02\x01\x03\x12\x03-\x1b\x1c\n\x0b\n\x04\x04\x02\x02\
    \x02\x12\x03.\x04\x1e\n\r\n\x05\x04\x02\x02\x02\x04\x12\x04.\x04-\x1d\n\
    \x0c\n\x05\x04\x02\x02\x02\x06\x12\x03.\x04\x0c\n\x0c\n\x05\x04\x02\x02\
    \x02\x01\x12\x03.\r\x19\n\x0c\n\x05\x04\x02\x02\x02\x03\x12\x03.\x1c\x1d\
    \n\x0b\n\x04\x04\x02\x02\x03\x12\x03/\x04#\n\x0c\n\x05\x04\x02\x02\x03\
    \x04\x12\x03/\x04\x0c\n\x0c\n\x05\x04\x02\x02\x03\x06\x12\x03/\r\x14\n\
    \x0c\n\x05\x04\x02\x02\x03\x01\x12\x03/\x15\x1e\n\x0c\n\x05\x04\x02\x02\
    \x03\x03\x12\x03/!\"\n\x0b\n\x04\x04\x02\x02\x04\x12\x030\x04\x1a\n\r\n\
    \x05\x04\x02\x02\x04\x04\x12\x040\x04/#\n\x0c\n\x05\x04\x02\x02\x04\x06\
    \x12\x030\x04\x0c\n\x0c\n\x05\x04\x02\x02\x04\x01\x12\x030\r\x15\n\x0c\n\
    \x05\x04\x02\x02\x04\x03\x12\x030\x18\x19\n\x0b\n\x04\x04\x02\x02\x05\
    \x12\x031\x04*\n\x0c\n\x05\x04\x02\x02\x05\x04\x12\x031\x04\x0c\n\x0c\n\
    \x05\x04\x02\x02\x05\x06\x12\x031\r\x1b\n\x0c\n\x05\x04\x02\x02\x05\x01\
    \x12\x031\x1c%\n\x0c\n\x05\x04\x02\x02\x05\x03\x12\x031()\n\x0b\n\x04\
    \x04\x02\x02\x06\x12\x032\x04\x1e\n\r\n\x05\x04\x02\x02\x06\x04\x12\x042\
    \x041*\n\x0c\n\x05\x04\x02\x02\x06\x06\x12\x032\x04\x0c\n\x0c\n\x05\x04\
    \x02\x02\x06\x01\x12\x032\r\x19\n\x0c\n\x05\x04\x02\x02\x06\x03\x12\x032\
    \x1c\x1d\n\x0b\n\x04\x04\x02\x02\x07\x12\x033\x04\x1e\n\r\n\x05\x04\x02\
    \x02\x07\x04\x12\x043\x042\x1e\n\x0c\n\x05\x04\x02\x02\x07\x06\x12\x033\
    \x04\x0c\n\x0c\n\x05\x04\x02\x02\x07\x01\x12\x033\r\x19\n\x0c\n\x05\x04\
    \x02\x02\x07\x03\x12\x033\x1c\x1d\n\x0b\n\x04\x04\x02\x02\x08\x12\x034\
    \x04,\n\x0c\n\x05\x04\x02\x02\x08\x04\x12\x034\x04\x0c\n\x0c\n\x05\x04\
    \x02\x02\x08\x06\x12\x034\r\x1b\n\x0c\n\x05\x04\x02\x02\x08\x01\x12\x034\
    \x1c'\n\x0c\n\x05\x04\x02\x02\x08\x03\x12\x034*+\n8\n\x02\x04\x03\x12\
    \x048\0G\x01\x1a,\x20Lists\x20the\x20stationary\x20and\x20moving\x20obst\
    acles.\n\n\n\n\x03\x04\x03\x01\x12\x038\x08\x11\n\x0c\n\x04\x04\x03\x03\
    \0\x12\x049\x04=\x05\n\x0c\n\x05\x04\x03\x03\0\x01\x12\x039\x0c\x1e\n\r\
    \n\x06\x04\x03\x03\0\x02\0\x12\x03:\x08\x1f\n\x0f\n\x07\x04\x03\x03\0\
    \x02\0\x04\x12\x04:\x089\x20\n\x0e\n\x07\x04\x03\x03\0\x02\0\x06\x12\x03\
    :\x08\x16\n\x0e\n\x07\x04\x03\x03\0\x02\0\x01\x12\x03:\x17\x1a\n\x0e\n\
    \x07\x04\x03\x03\0\x02\0\x03\x12\x03:\x1d\x1e\n\r\n\x06\x04\x03\x03\0\
    \x02\x01\x12\x03;\x08\x1a\n\x0f\n\x07\x04\x03\x03\0\x02\x01\x04\x12\x04;\
    \x08:\x1f\n\x0e\n\x07\x04\x03\x03\0\x02\x01\x05\x12\x03;\x08\x0e\n\x0e\n\
    \x07\x04\x03\x03\0\x02\x01\x01\x12\x03;\x0f\x15\n\x0e\n\x07\x04\x03\x03\
    \0\x02\x01\x03\x12\x03;\x18\x19\n\r\n\x06\x04\x03\x03\0\x02\x02\x12\x03<\
    \x08\x1a\n\x0f\n\x07\x04\x03\x03\0\x02\x02\x04\x12\x04<\x08;\x1a\n\x0e\n\
    \x07\x04\x03\x03\0\x02\x02\x05\x12\x03<\x08\x0e\n\x0e\n\x07\x04\x03\x03\
    \0\x02\x02\x01\x12\x03<\x0f\x15\n\x0e\n\x07\x04\x03\x03\0\x02\x02\x03\
    \x12\x03<\x18\x19\n\x0c\n\x04\x04\x03\x03\x01\x12\x04?\x04B\x05\n\x0c\n\
    \x05\x04\x03\x03\x01\x01\x12\x03?\x0c\x1a\n\r\n\x06\x04\x03\x03\x01\x02\
    \0\x12\x03@\x08\x19\n\x0f\n\x07\x04\x03\x03\x01\x02\0\x04\x12\x04@\x08?\
    \x1c\n\x0e\n\x07\x04\x03\x03\x01\x02\0\x06\x12\x03@\x08\x10\n\x0e\n\x07\
    \x04\x03\x03\x01\x02\0\x01\x12\x03@\x11\x14\n\x0e\n\x07\x04\x03\x03\x01\
    \x02\0\x03\x12\x03@\x17\x18\n\r\n\x06\x04\x03\x03\x01\x02\x01\x12\x03A\
    \x08\x1a\n\x0f\n\x07\x04\x03\x03\x01\x02\x01\x04\x12\x04A\x08@\x19\n\x0e\
    \n\x07\x04\x03\x03\x01\x02\x01\x05\x12\x03A\x08\x0e\n\x0e\n\x07\x04\x03\
    \x03\x01\x02\x01\x01\x12\x03A\x0f\x15\n\x0e\n\x07\x04\x03\x03\x01\x02\
    \x01\x03\x12\x03A\x18\x19\n\x0b\n\x04\x04\x03\x02\0\x12\x03D\x04\x14\n\r\
    \n\x05\x04\x03\x02\0\x04\x12\x04D\x04B\x05\n\x0c\n\x05\x04\x03\x02\0\x05\
    \x12\x03D\x04\n\n\x0c\n\x05\x04\x03\x02\0\x01\x12\x03D\x0b\x0f\n\x0c\n\
    \x05\x04\x03\x02\0\x03\x12\x03D\x12\x13\n\x0b\n\x04\x04\x03\x02\x01\x12\
    \x03E\x04/\n\x0c\n\x05\x04\x03\x02\x01\x04\x12\x03E\x04\x0c\n\x0c\n\x05\
    \x04\x03\x02\x01\x06\x12\x03E\r\x1f\n\x0c\n\x05\x04\x03\x02\x01\x01\x12\
    \x03E\x20*\n\x0c\n\x05\x04\x03\x02\x01\x03\x12\x03E-.\n\x0b\n\x04\x04\
    \x03\x02\x02\x12\x03F\x04'\n\x0c\n\x05\x04\x03\x02\x02\x04\x12\x03F\x04\
    \x0c\n\x0c\n\x05\x04\x03\x02\x02\x06\x12\x03F\r\x1b\n\x0c\n\x05\x04\x03\
    \x02\x02\x01\x12\x03F\x1c\"\n\x0c\n\x05\x04\x03\x02\x02\x03\x12\x03F%&\n\
    0\n\x02\x04\x04\x12\x04J\0N\x01\x1a$\x20Telemetry\x20to\x20upload\x20to\
    \x20the\x20server.\n\n\n\n\x03\x04\x04\x01\x12\x03J\x08\x14\n\x0b\n\x04\
    \x04\x04\x02\0\x12\x03K\x04\x14\n\r\n\x05\x04\x04\x02\0\x04\x12\x04K\x04\
    J\x16\n\x0c\n\x05\x04\x04\x02\0\x05\x12\x03K\x04\n\n\x0c\n\x05\x04\x04\
    \x02\0\x01\x12\x03K\x0b\x0f\n\x0c\n\x05\x04\x04\x02\0\x03\x12\x03K\x12\
    \x13\n\x0b\n\x04\x04\x04\x02\x01\x12\x03L\x04\x1b\n\r\n\x05\x04\x04\x02\
    \x01\x04\x12\x04L\x04K\x14\n\x0c\n\x05\x04\x04\x02\x01\x06\x12\x03L\x04\
    \x12\n\x0c\n\x05\x04\x04\x02\x01\x01\x12\x03L\x13\x16\n\x0c\n\x05\x04\
    \x04\x02\x01\x03\x12\x03L\x19\x1a\n\x0b\n\x04\x04\x04\x02\x02\x12\x03M\
    \x04\x13\n\r\n\x05\x04\x04\x02\x02\x04\x12\x04M\x04L\x1b\n\x0c\n\x05\x04\
    \x04\x02\x02\x05\x12\x03M\x04\n\n\x0c\n\x05\x04\x04\x02\x02\x01\x12\x03M\
    \x0b\x0e\n\x0c\n\x05\x04\x04\x02\x02\x03\x12\x03M\x11\x12\nE\n\x02\x04\
    \x05\x12\x05Q\0\x91\x01\x01\x1a8\x20Target\x20on\x20the\x20interop\x20se\
    rver,\x20also\x20includes\x20the\x20image.\n\n\n\n\x03\x04\x05\x01\x12\
    \x03Q\x08\x0c\n\x0c\n\x04\x04\x05\x04\0\x12\x04R\x04V\x05\n\x0c\n\x05\
    \x04\x05\x04\0\x01\x12\x03R\t\r\n\r\n\x06\x04\x05\x04\0\x02\0\x12\x03S\
    \x08\x15\n\x0e\n\x07\x04\x05\x04\0\x02\0\x01\x12\x03S\x08\x10\n\x0e\n\
    \x07\x04\x05\x04\0\x02\0\x02\x12\x03S\x13\x14\n\r\n\x06\x04\x05\x04\0\
    \x02\x01\x12\x03T\x08\x15\n\x0e\n\x07\x04\x05\x04\0\x02\x01\x01\x12\x03T\
    \x08\x10\n\x0e\n\x07\x04\x05\x04\0\x02\x01\x02\x12\x03T\x13\x14\n\r\n\
    \x06\x04\x05\x04\0\x02\x02\x12\x03U\x08\x15\n\x0e\n\x07\x04\x05\x04\0\
    \x02\x02\x01\x12\x03U\x08\x10\n\x0e\n\x07\x04\x05\x04\0\x02\x02\x02\x12\
    \x03U\x13\x14\n\x0c\n\x04\x04\x05\x04\x01\x12\x04X\x04b\x05\n\x0c\n\x05\
    \x04\x05\x04\x01\x01\x12\x03X\t\x14\n\r\n\x06\x04\x05\x04\x01\x02\0\x12\
    \x03Y\x08\x20\n\x0e\n\x07\x04\x05\x04\x01\x02\0\x01\x12\x03Y\x08\x1b\n\
    \x0e\n\x07\x04\x05\x04\x01\x02\0\x02\x12\x03Y\x1e\x1f\n\r\n\x06\x04\x05\
    \x04\x01\x02\x01\x12\x03Z\x08\x12\n\x0e\n\x07\x04\x05\x04\x01\x02\x01\
    \x01\x12\x03Z\x08\r\n\x0e\n\x07\x04\x05\x04\x01\x02\x01\x02\x12\x03Z\x10\
    \x11\n\r\n\x06\x04\x05\x04\x01\x02\x02\x12\x03[\x08\x16\n\x0e\n\x07\x04\
    \x05\x04\x01\x02\x02\x01\x12\x03[\x08\x11\n\x0e\n\x07\x04\x05\x04\x01\
    \x02\x02\x02\x12\x03[\x14\x15\n\r\n\x06\x04\x05\x04\x01\x02\x03\x12\x03\
    \\\x08\x11\n\x0e\n\x07\x04\x05\x04\x01\x02\x03\x01\x12\x03\\\x08\x0c\n\
    \x0e\n\x07\x04\x05\x04\x01\x02\x03\x02\x12\x03\\\x0f\x10\n\r\n\x06\x04\
    \x05\x04\x01\x02\x04\x12\x03]\x08\x16\n\x0e\n\x07\x04\x05\x04\x01\x02\
    \x04\x01\x12\x03]\x08\x11\n\x0e\n\x07\x04\x05\x04\x01\x02\x04\x02\x12\
    \x03]\x14\x15\n\r\n\x06\x04\x05\x04\x01\x02\x05\x12\x03^\x08\x12\n\x0e\n\
    \x07\x04\x05\x04\x01\x02\x05\x01\x12\x03^\x08\r\n\x0e\n\x07\x04\x05\x04\
    \x01\x02\x05\x02\x12\x03^\x10\x11\n\r\n\x06\x04\x05\x04\x01\x02\x06\x12\
    \x03_\x08\x16\n\x0e\n\x07\x04\x05\x04\x01\x02\x06\x01\x12\x03_\x08\x11\n\
    \x0e\n\x07\x04\x05\x04\x01\x02\x06\x02\x12\x03_\x14\x15\n\r\n\x06\x04\
    \x05\x04\x01\x02\x07\x12\x03`\x08\x11\n\x0e\n\x07\x04\x05\x04\x01\x02\
    \x07\x01\x12\x03`\x08\x0c\n\x0e\n\x07\x04\x05\x04\x01\x02\x07\x02\x12\
    \x03`\x0f\x10\n\r\n\x06\x04\x05\x04\x01\x02\x08\x12\x03a\x08\x16\n\x0e\n\
    \x07\x04\x05\x04\x01\x02\x08\x01\x12\x03a\x08\x11\n\x0e\n\x07\x04\x05\
    \x04\x01\x02\x08\x02\x12\x03a\x14\x15\n\x0c\n\x04\x04\x05\x04\x02\x12\
    \x04d\x04s\x05\n\x0c\n\x05\x04\x05\x04\x02\x01\x12\x03d\t\x0e\n\r\n\x06\
    \x04\x05\x04\x02\x02\0\x12\x03e\x08\x1a\n\x0e\n\x07\x04\x05\x04\x02\x02\
    \0\x01\x12\x03e\x08\x15\n\x0e\n\x07\x04\x05\x04\x02\x02\0\x02\x12\x03e\
    \x18\x19\n\r\n\x06\x04\x05\x04\x02\x02\x01\x12\x03f\x08\x13\n\x0e\n\x07\
    \x04\x05\x04\x02\x02\x01\x01\x12\x03f\x08\x0e\n\x0e\n\x07\x04\x05\x04\
    \x02\x02\x01\x02\x12\x03f\x11\x12\n\r\n\x06\x04\x05\x04\x02\x02\x02\x12\
    \x03g\x08\x17\n\x0e\n\x07\x04\x05\x04\x02\x02\x02\x01\x12\x03g\x08\x12\n\
    \x0e\n\x07\x04\x05\x04\x02\x02\x02\x02\x12\x03g\x15\x16\n\r\n\x06\x04\
    \x05\x04\x02\x02\x03\x12\x03h\x08\x1b\n\x0e\n\x07\x04\x05\x04\x02\x02\
    \x03\x01\x12\x03h\x08\x16\n\x0e\n\x07\x04\x05\x04\x02\x02\x03\x02\x12\
    \x03h\x19\x1a\n\r\n\x06\x04\x05\x04\x02\x02\x04\x12\x03i\x08\x15\n\x0e\n\
    \x07\x04\x05\x04\x02\x02\x04\x01\x12\x03i\x08\x10\n\x0e\n\x07\x04\x05\
    \x04\x02\x02\x04\x02\x12\x03i\x13\x14\n\r\n\x06\x04\x05\x04\x02\x02\x05\
    \x12\x03j\x08\x13\n\x0e\n\x07\x04\x05\x04\x02\x02\x05\x01\x12\x03j\x08\
    \x0e\n\x0e\n\x07\x04\x05\x04\x02\x02\x05\x02\x12\x03j\x11\x12\n\r\n\x06\
    \x04\x05\x04\x02\x02\x06\x12\x03k\x08\x16\n\x0e\n\x07\x04\x05\x04\x02\
    \x02\x06\x01\x12\x03k\x08\x11\n\x0e\n\x07\x04\x05\x04\x02\x02\x06\x02\
    \x12\x03k\x14\x15\n\r\n\x06\x04\x05\x04\x02\x02\x07\x12\x03l\x08\x16\n\
    \x0e\n\x07\x04\x05\x04\x02\x02\x07\x01\x12\x03l\x08\x11\n\x0e\n\x07\x04\
    \x05\x04\x02\x02\x07\x02\x12\x03l\x14\x15\n\r\n\x06\x04\x05\x04\x02\x02\
    \x08\x12\x03m\x08\x15\n\x0e\n\x07\x04\x05\x04\x02\x02\x08\x01\x12\x03m\
    \x08\x10\n\x0e\n\x07\x04\x05\x04\x02\x02\x08\x02\x12\x03m\x13\x14\n\r\n\
    \x06\x04\x05\x04\x02\x02\t\x12\x03n\x08\x14\n\x0e\n\x07\x04\x05\x04\x02\
    \x02\t\x01\x12\x03n\x08\x0f\n\x0e\n\x07\x04\x05\x04\x02\x02\t\x02\x12\
    \x03n\x12\x13\n\r\n\x06\x04\x05\x04\x02\x02\n\x12\x03o\x08\x16\n\x0e\n\
    \x07\x04\x05\x04\x02\x02\n\x01\x12\x03o\x08\x10\n\x0e\n\x07\x04\x05\x04\
    \x02\x02\n\x02\x12\x03o\x13\x15\n\r\n\x06\x04\x05\x04\x02\x02\x0b\x12\
    \x03p\x08\x15\n\x0e\n\x07\x04\x05\x04\x02\x02\x0b\x01\x12\x03p\x08\x0f\n\
    \x0e\n\x07\x04\x05\x04\x02\x02\x0b\x02\x12\x03p\x12\x14\n\r\n\x06\x04\
    \x05\x04\x02\x02\x0c\x12\x03q\x08\x12\n\x0e\n\x07\x04\x05\x04\x02\x02\
    \x0c\x01\x12\x03q\x08\x0c\n\x0e\n\x07\x04\x05\x04\x02\x02\x0c\x02\x12\
    \x03q\x0f\x11\n\r\n\x06\x04\x05\x04\x02\x02\r\x12\x03r\x08\x13\n\x0e\n\
    \x07\x04\x05\x04\x02\x02\r\x01\x12\x03r\x08\r\n\x0e\n\x07\x04\x05\x04\
    \x02\x02\r\x02\x12\x03r\x10\x12\n\r\n\x04\x04\x05\x04\x03\x12\x05u\x04\
    \x81\x01\x05\n\x0c\n\x05\x04\x05\x04\x03\x01\x12\x03u\t\x0e\n\r\n\x06\
    \x04\x05\x04\x03\x02\0\x12\x03v\x08\x1a\n\x0e\n\x07\x04\x05\x04\x03\x02\
    \0\x01\x12\x03v\x08\x15\n\x0e\n\x07\x04\x05\x04\x03\x02\0\x02\x12\x03v\
    \x18\x19\n\r\n\x06\x04\x05\x04\x03\x02\x01\x12\x03w\x08\x12\n\x0e\n\x07\
    \x04\x05\x04\x03\x02\x01\x01\x12\x03w\x08\r\n\x0e\n\x07\x04\x05\x04\x03\
    \x02\x01\x02\x12\x03w\x10\x11\n\r\n\x06\x04\x05\x04\x03\x02\x02\x12\x03x\
    \x08\x12\n\x0e\n\x07\x04\x05\x04\x03\x02\x02\x01\x12\x03x\x08\r\n\x0e\n\
    \x07\x04\x05\x04\x03\x02\x02\x02\x12\x03x\x10\x11\n\r\n\x06\x04\x05\x04\
    \x03\x02\x03\x12\x03y\x08\x11\n\x0e\n\x07\x04\x05\x04\x03\x02\x03\x01\
    \x12\x03y\x08\x0c\n\x0e\n\x07\x04\x05\x04\x03\x02\x03\x02\x12\x03y\x0f\
    \x10\n\r\n\x06\x04\x05\x04\x03\x02\x04\x12\x03z\x08\x10\n\x0e\n\x07\x04\
    \x05\x04\x03\x02\x04\x01\x12\x03z\x08\x0b\n\x0e\n\x07\x04\x05\x04\x03\
    \x02\x04\x02\x12\x03z\x0e\x0f\n\r\n\x06\x04\x05\x04\x03\x02\x05\x12\x03{\
    \x08\x11\n\x0e\n\x07\x04\x05\x04\x03\x02\x05\x01\x12\x03{\x08\x0c\n\x0e\
    \n\x07\x04\x05\x04\x03\x02\x05\x02\x12\x03{\x0f\x10\n\r\n\x06\x04\x05\
    \x04\x03\x02\x06\x12\x03|\x08\x12\n\x0e\n\x07\x04\x05\x04\x03\x02\x06\
    \x01\x12\x03|\x08\r\n\x0e\n\x07\x04\x05\x04\x03\x02\x06\x02\x12\x03|\x10\
    \x11\n\r\n\x06\x04\x05\x04\x03\x02\x07\x12\x03}\x08\x13\n\x0e\n\x07\x04\
    \x05\x04\x03\x02\x07\x01\x12\x03}\x08\x0e\n\x0e\n\x07\x04\x05\x04\x03\
    \x02\x07\x02\x12\x03}\x11\x12\n\r\n\x06\x04\x05\x04\x03\x02\x08\x12\x03~\
    \x08\x13\n\x0e\n\x07\x04\x05\x04\x03\x02\x08\x01\x12\x03~\x08\x0e\n\x0e\
    \n\x07\x04\x05\x04\x03\x02\x08\x02\x12\x03~\x11\x12\n\r\n\x06\x04\x05\
    \x04\x03\x02\t\x12\x03\x7f\x08\x12\n\x0e\n\x07\x04\x05\x04\x03\x02\t\x01\
    \x12\x03\x7f\x08\r\n\x0e\n\x07\x04\x05\x04\x03\x02\t\x02\x12\x03\x7f\x10\
    \x11\n\x0e\n\x06\x04\x05\x04\x03\x02\n\x12\x04\x80\x01\x08\x14\n\x0f\n\
    \x07\x04\x05\x04\x03\x02\n\x01\x12\x04\x80\x01\x08\x0e\n\x0f\n\x07\x04\
    \x05\x04\x03\x02\n\x02\x12\x04\x80\x01\x11\x13\n\x0c\n\x04\x04\x05\x02\0\
    \x12\x04\x83\x01\x04\x14\n\x0f\n\x05\x04\x05\x02\0\x04\x12\x06\x83\x01\
    \x04\x81\x01\x05\n\r\n\x05\x04\x05\x02\0\x05\x12\x04\x83\x01\x04\n\n\r\n\
    \x05\x04\x05\x02\0\x01\x12\x04\x83\x01\x0b\x0f\n\r\n\x05\x04\x05\x02\0\
    \x03\x12\x04\x83\x01\x12\x13\n1\n\x04\x04\x05\x02\x01\x12\x04\x85\x01\
    \x04\x12\x1a#\x20id\x20number\x20provided\x20by\x20the\x20server.\n\n\
    \x0f\n\x05\x04\x05\x02\x01\x04\x12\x06\x85\x01\x04\x83\x01\x14\n\r\n\x05\
    \x04\x05\x02\x01\x05\x12\x04\x85\x01\x04\n\n\r\n\x05\x04\x05\x02\x01\x01\
    \x12\x04\x85\x01\x0b\r\n\r\n\x05\x04\x05\x02\x01\x03\x12\x04\x85\x01\x10\
    \x11\n\x0c\n\x04\x04\x05\x02\x02\x12\x04\x86\x01\x04\x12\n\x0f\n\x05\x04\
    \x05\x02\x02\x04\x12\x06\x86\x01\x04\x85\x01\x12\n\r\n\x05\x04\x05\x02\
    \x02\x06\x12\x04\x86\x01\x04\x08\n\r\n\x05\x04\x05\x02\x02\x01\x12\x04\
    \x86\x01\t\r\n\r\n\x05\x04\x05\x02\x02\x03\x12\x04\x86\x01\x10\x11\n\x0c\
    \n\x04\x04\x05\x02\x03\x12\x04\x87\x01\x04\x15\n\x0f\n\x05\x04\x05\x02\
    \x03\x04\x12\x06\x87\x01\x04\x86\x01\x12\n\r\n\x05\x04\x05\x02\x03\x06\
    \x12\x04\x87\x01\x04\x0c\n\r\n\x05\x04\x05\x02\x03\x01\x12\x04\x87\x01\r\
    \x10\n\r\n\x05\x04\x05\x02\x03\x03\x12\x04\x87\x01\x13\x14\n\x0c\n\x04\
    \x04\x05\x02\x04\x12\x04\x88\x01\x04\x20\n\x0f\n\x05\x04\x05\x02\x04\x04\
    \x12\x06\x88\x01\x04\x87\x01\x15\n\r\n\x05\x04\x05\x02\x04\x06\x12\x04\
    \x88\x01\x04\x0f\n\r\n\x05\x04\x05\x02\x04\x01\x12\x04\x88\x01\x10\x1b\n\
    \r\n\x05\x04\x05\x02\x04\x03\x12\x04\x88\x01\x1e\x1f\n\x0c\n\x04\x04\x05\
    \x02\x05\x12\x04\x89\x01\x04\x14\n\x0f\n\x05\x04\x05\x02\x05\x04\x12\x06\
    \x89\x01\x04\x88\x01\x20\n\r\n\x05\x04\x05\x02\x05\x06\x12\x04\x89\x01\
    \x04\t\n\r\n\x05\x04\x05\x02\x05\x01\x12\x04\x89\x01\n\x0f\n\r\n\x05\x04\
    \x05\x02\x05\x03\x12\x04\x89\x01\x12\x13\n\x0c\n\x04\x04\x05\x02\x06\x12\
    \x04\x8a\x01\x04\x1f\n\x0f\n\x05\x04\x05\x02\x06\x04\x12\x06\x8a\x01\x04\
    \x89\x01\x14\n\r\n\x05\x04\x05\x02\x06\x06\x12\x04\x8a\x01\x04\t\n\r\n\
    \x05\x04\x05\x02\x06\x01\x12\x04\x8a\x01\n\x1a\n\r\n\x05\x04\x05\x02\x06\
    \x03\x12\x04\x8a\x01\x1d\x1e\n\x0c\n\x04\x04\x05\x02\x07\x12\x04\x8b\x01\
    \x04\x1c\n\x0f\n\x05\x04\x05\x02\x07\x04\x12\x06\x8b\x01\x04\x8a\x01\x1f\
    \n\r\n\x05\x04\x05\x02\x07\x05\x12\x04\x8b\x01\x04\n\n\r\n\x05\x04\x05\
    \x02\x07\x01\x12\x04\x8b\x01\x0b\x17\n\r\n\x05\x04\x05\x02\x07\x03\x12\
    \x04\x8b\x01\x1a\x1b\n\x0c\n\x04\x04\x05\x02\x08\x12\x04\x8c\x01\x04!\n\
    \x0f\n\x05\x04\x05\x02\x08\x04\x12\x06\x8c\x01\x04\x8b\x01\x1c\n\r\n\x05\
    \x04\x05\x02\x08\x06\x12\x04\x8c\x01\x04\t\n\r\n\x05\x04\x05\x02\x08\x01\
    \x12\x04\x8c\x01\n\x1c\n\r\n\x05\x04\x05\x02\x08\x03\x12\x04\x8c\x01\x1f\
    \x20\n\x0c\n\x04\x04\x05\x02\t\x12\x04\x8d\x01\x04\x1c\n\x0f\n\x05\x04\
    \x05\x02\t\x04\x12\x06\x8d\x01\x04\x8c\x01!\n\r\n\x05\x04\x05\x02\t\x05\
    \x12\x04\x8d\x01\x04\n\n\r\n\x05\x04\x05\x02\t\x01\x12\x04\x8d\x01\x0b\
    \x16\n\r\n\x05\x04\x05\x02\t\x03\x12\x04\x8d\x01\x19\x1b\n\x0c\n\x04\x04\
    \x05\x02\n\x12\x04\x8e\x01\x04\x19\n\x0f\n\x05\x04\x05\x02\n\x04\x12\x06\
    \x8e\x01\x04\x8d\x01\x1c\n\r\n\x05\x04\x05\x02\n\x05\x12\x04\x8e\x01\x04\
    \x08\n\r\n\x05\x04\x05\x02\n\x01\x12\x04\x8e\x01\t\x13\n\r\n\x05\x04\x05\
    \x02\n\x03\x12\x04\x8e\x01\x16\x18\n*\n\x04\x04\x05\x02\x0b\x12\x04\x90\
    \x01\x04\x15\x1a\x1c\x20Must\x20be\x20a\x20png\x20if\x20provided.\n\n\
    \x0f\n\x05\x04\x05\x02\x0b\x04\x12\x06\x90\x01\x04\x8e\x01\x19\n\r\n\x05\
    \x04\x05\x02\x0b\x05\x12\x04\x90\x01\x04\t\n\r\n\x05\x04\x05\x02\x0b\x01\
    \x12\x04\x90\x01\n\x0f\n\r\n\x05\x04\x05\x02\x0b\x03\x12\x04\x90\x01\x12\
    \x14\n2\n\x02\x04\x06\x12\x06\x94\x01\0\x97\x01\x01\x1a$\x20Message\x20f\
    or\x20listing\x20all\x20the\x20odlcs.\n\n\x0b\n\x03\x04\x06\x01\x12\x04\
    \x94\x01\x08\x10\n\x0c\n\x04\x04\x06\x02\0\x12\x04\x95\x01\x04\x14\n\x0f\
    \n\x05\x04\x06\x02\0\x04\x12\x06\x95\x01\x04\x94\x01\x12\n\r\n\x05\x04\
    \x06\x02\0\x05\x12\x04\x95\x01\x04\n\n\r\n\x05\x04\x06\x02\0\x01\x12\x04\
    \x95\x01\x0b\x0f\n\r\n\x05\x04\x06\x02\0\x03\x12\x04\x95\x01\x12\x13\n\
    \x0c\n\x04\x04\x06\x02\x01\x12\x04\x96\x01\x04\x1b\n\r\n\x05\x04\x06\x02\
    \x01\x04\x12\x04\x96\x01\x04\x0c\n\r\n\x05\x04\x06\x02\x01\x06\x12\x04\
    \x96\x01\r\x11\n\r\n\x05\x04\x06\x02\x01\x01\x12\x04\x96\x01\x12\x16\n\r\
    \n\x05\x04\x06\x02\x01\x03\x12\x04\x96\x01\x19\x1a\nR\n\x02\x04\x07\x12\
    \x06\x9a\x01\0\x9d\x01\x01\x1aD\x20Message\x20containing\x20text\x20sent\
    \x20back\x20from\x20the\x20server\x20after\x20a\x20request.\n\n\x0b\n\
    \x03\x04\x07\x01\x12\x04\x9a\x01\x08\x16\n\x0c\n\x04\x04\x07\x02\0\x12\
    \x04\x9b\x01\x04\x14\n\x0f\n\x05\x04\x07\x02\0\x04\x12\x06\x9b\x01\x04\
    \x9a\x01\x18\n\r\n\x05\x04\x07\x02\0\x05\x12\x04\x9b\x01\x04\n\n\r\n\x05\
    \x04\x07\x02\0\x01\x12\x04\x9b\x01\x0b\x0f\n\r\n\x05\x04\x07\x02\0\x03\
    \x12\x04\x9b\x01\x12\x13\n\x0c\n\x04\x04\x07\x02\x01\x12\x04\x9c\x01\x04\
    \x14\n\x0f\n\x05\x04\x07\x02\x01\x04\x12\x06\x9c\x01\x04\x9b\x01\x14\n\r\
    \n\x05\x04\x07\x02\x01\x05\x12\x04\x9c\x01\x04\n\n\r\n\x05\x04\x07\x02\
    \x01\x01\x12\x04\x9c\x01\x0b\x0f\n\r\n\x05\x04\x07\x02\x01\x03\x12\x04\
    \x9c\x01\x12\x13b\x06proto3\
";

static mut file_descriptor_proto_lazy: ::protobuf::lazy::Lazy<::protobuf::descriptor::FileDescriptorProto> = ::protobuf::lazy::Lazy {
    lock: ::protobuf::lazy::ONCE_INIT,
    ptr: 0 as *const ::protobuf::descriptor::FileDescriptorProto,
};

fn parse_descriptor_proto() -> ::protobuf::descriptor::FileDescriptorProto {
    ::protobuf::parse_from_bytes(file_descriptor_proto_data).unwrap()
}

pub fn file_descriptor_proto() -> &'static ::protobuf::descriptor::FileDescriptorProto {
    unsafe {
        file_descriptor_proto_lazy.get(|| {
            parse_descriptor_proto()
        })
    }
}
