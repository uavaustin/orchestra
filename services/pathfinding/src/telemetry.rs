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
pub struct CameraTelem {
    // message fields
    pub time: f64,
    pub lat: f64,
    pub lon: f64,
    pub alt: f64,
    pub yaw: f64,
    pub pitch: f64,
    pub roll: f64,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for CameraTelem {}

impl CameraTelem {
    pub fn new() -> CameraTelem {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static CameraTelem {
        static mut instance: ::protobuf::lazy::Lazy<CameraTelem> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const CameraTelem,
        };
        unsafe {
            instance.get(CameraTelem::new)
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

    // double lat = 2;

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

    // double lon = 3;

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

    // double alt = 4;

    pub fn clear_alt(&mut self) {
        self.alt = 0.;
    }

    // Param is passed by value, moved
    pub fn set_alt(&mut self, v: f64) {
        self.alt = v;
    }

    pub fn get_alt(&self) -> f64 {
        self.alt
    }

    fn get_alt_for_reflect(&self) -> &f64 {
        &self.alt
    }

    fn mut_alt_for_reflect(&mut self) -> &mut f64 {
        &mut self.alt
    }

    // double yaw = 5;

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

    // double pitch = 6;

    pub fn clear_pitch(&mut self) {
        self.pitch = 0.;
    }

    // Param is passed by value, moved
    pub fn set_pitch(&mut self, v: f64) {
        self.pitch = v;
    }

    pub fn get_pitch(&self) -> f64 {
        self.pitch
    }

    fn get_pitch_for_reflect(&self) -> &f64 {
        &self.pitch
    }

    fn mut_pitch_for_reflect(&mut self) -> &mut f64 {
        &mut self.pitch
    }

    // double roll = 7;

    pub fn clear_roll(&mut self) {
        self.roll = 0.;
    }

    // Param is passed by value, moved
    pub fn set_roll(&mut self, v: f64) {
        self.roll = v;
    }

    pub fn get_roll(&self) -> f64 {
        self.roll
    }

    fn get_roll_for_reflect(&self) -> &f64 {
        &self.roll
    }

    fn mut_roll_for_reflect(&mut self) -> &mut f64 {
        &mut self.roll
    }
}

impl ::protobuf::Message for CameraTelem {
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
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.lat = tmp;
                },
                3 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.lon = tmp;
                },
                4 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.alt = tmp;
                },
                5 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.yaw = tmp;
                },
                6 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.pitch = tmp;
                },
                7 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.roll = tmp;
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
        if self.lat != 0. {
            my_size += 9;
        }
        if self.lon != 0. {
            my_size += 9;
        }
        if self.alt != 0. {
            my_size += 9;
        }
        if self.yaw != 0. {
            my_size += 9;
        }
        if self.pitch != 0. {
            my_size += 9;
        }
        if self.roll != 0. {
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
        if self.lat != 0. {
            os.write_double(2, self.lat)?;
        }
        if self.lon != 0. {
            os.write_double(3, self.lon)?;
        }
        if self.alt != 0. {
            os.write_double(4, self.alt)?;
        }
        if self.yaw != 0. {
            os.write_double(5, self.yaw)?;
        }
        if self.pitch != 0. {
            os.write_double(6, self.pitch)?;
        }
        if self.roll != 0. {
            os.write_double(7, self.roll)?;
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

impl ::protobuf::MessageStatic for CameraTelem {
    fn new() -> CameraTelem {
        CameraTelem::new()
    }

    fn descriptor_static(_: ::std::option::Option<CameraTelem>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "time",
                    CameraTelem::get_time_for_reflect,
                    CameraTelem::mut_time_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "lat",
                    CameraTelem::get_lat_for_reflect,
                    CameraTelem::mut_lat_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "lon",
                    CameraTelem::get_lon_for_reflect,
                    CameraTelem::mut_lon_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "alt",
                    CameraTelem::get_alt_for_reflect,
                    CameraTelem::mut_alt_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "yaw",
                    CameraTelem::get_yaw_for_reflect,
                    CameraTelem::mut_yaw_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "pitch",
                    CameraTelem::get_pitch_for_reflect,
                    CameraTelem::mut_pitch_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "roll",
                    CameraTelem::get_roll_for_reflect,
                    CameraTelem::mut_roll_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<CameraTelem>(
                    "CameraTelem",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for CameraTelem {
    fn clear(&mut self) {
        self.clear_time();
        self.clear_lat();
        self.clear_lon();
        self.clear_alt();
        self.clear_yaw();
        self.clear_pitch();
        self.clear_roll();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for CameraTelem {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for CameraTelem {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

#[derive(PartialEq,Clone,Default)]
pub struct RawMission {
    // message fields
    pub time: f64,
    pub next: u32,
    pub commands: ::protobuf::RepeatedField<RawMission_Command>,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for RawMission {}

impl RawMission {
    pub fn new() -> RawMission {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static RawMission {
        static mut instance: ::protobuf::lazy::Lazy<RawMission> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const RawMission,
        };
        unsafe {
            instance.get(RawMission::new)
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

    // uint32 next = 2;

    pub fn clear_next(&mut self) {
        self.next = 0;
    }

    // Param is passed by value, moved
    pub fn set_next(&mut self, v: u32) {
        self.next = v;
    }

    pub fn get_next(&self) -> u32 {
        self.next
    }

    fn get_next_for_reflect(&self) -> &u32 {
        &self.next
    }

    fn mut_next_for_reflect(&mut self) -> &mut u32 {
        &mut self.next
    }

    // repeated .telemetry.RawMission.Command commands = 3;

    pub fn clear_commands(&mut self) {
        self.commands.clear();
    }

    // Param is passed by value, moved
    pub fn set_commands(&mut self, v: ::protobuf::RepeatedField<RawMission_Command>) {
        self.commands = v;
    }

    // Mutable pointer to the field.
    pub fn mut_commands(&mut self) -> &mut ::protobuf::RepeatedField<RawMission_Command> {
        &mut self.commands
    }

    // Take field
    pub fn take_commands(&mut self) -> ::protobuf::RepeatedField<RawMission_Command> {
        ::std::mem::replace(&mut self.commands, ::protobuf::RepeatedField::new())
    }

    pub fn get_commands(&self) -> &[RawMission_Command] {
        &self.commands
    }

    fn get_commands_for_reflect(&self) -> &::protobuf::RepeatedField<RawMission_Command> {
        &self.commands
    }

    fn mut_commands_for_reflect(&mut self) -> &mut ::protobuf::RepeatedField<RawMission_Command> {
        &mut self.commands
    }
}

impl ::protobuf::Message for RawMission {
    fn is_initialized(&self) -> bool {
        for v in &self.commands {
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
                    self.next = tmp;
                },
                3 => {
                    ::protobuf::rt::read_repeated_message_into(wire_type, is, &mut self.commands)?;
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
        if self.next != 0 {
            my_size += ::protobuf::rt::value_size(2, self.next, ::protobuf::wire_format::WireTypeVarint);
        }
        for value in &self.commands {
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
        if self.next != 0 {
            os.write_uint32(2, self.next)?;
        }
        for v in &self.commands {
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

impl ::protobuf::MessageStatic for RawMission {
    fn new() -> RawMission {
        RawMission::new()
    }

    fn descriptor_static(_: ::std::option::Option<RawMission>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "time",
                    RawMission::get_time_for_reflect,
                    RawMission::mut_time_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeUint32>(
                    "next",
                    RawMission::get_next_for_reflect,
                    RawMission::mut_next_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_repeated_field_accessor::<_, ::protobuf::types::ProtobufTypeMessage<RawMission_Command>>(
                    "commands",
                    RawMission::get_commands_for_reflect,
                    RawMission::mut_commands_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<RawMission>(
                    "RawMission",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for RawMission {
    fn clear(&mut self) {
        self.clear_time();
        self.clear_next();
        self.clear_commands();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for RawMission {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for RawMission {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

#[derive(PartialEq,Clone,Default)]
pub struct RawMission_Command {
    // message fields
    pub target_system: u32,
    pub target_component: u32,
    pub seq: u32,
    pub frame: u32,
    pub command: u32,
    pub param_1: f64,
    pub param_2: f64,
    pub param_3: f64,
    pub param_4: f64,
    pub param_5: f64,
    pub param_6: f64,
    pub param_7: f64,
    // special fields
    unknown_fields: ::protobuf::UnknownFields,
    cached_size: ::protobuf::CachedSize,
}

// see codegen.rs for the explanation why impl Sync explicitly
unsafe impl ::std::marker::Sync for RawMission_Command {}

impl RawMission_Command {
    pub fn new() -> RawMission_Command {
        ::std::default::Default::default()
    }

    pub fn default_instance() -> &'static RawMission_Command {
        static mut instance: ::protobuf::lazy::Lazy<RawMission_Command> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const RawMission_Command,
        };
        unsafe {
            instance.get(RawMission_Command::new)
        }
    }

    // uint32 target_system = 1;

    pub fn clear_target_system(&mut self) {
        self.target_system = 0;
    }

    // Param is passed by value, moved
    pub fn set_target_system(&mut self, v: u32) {
        self.target_system = v;
    }

    pub fn get_target_system(&self) -> u32 {
        self.target_system
    }

    fn get_target_system_for_reflect(&self) -> &u32 {
        &self.target_system
    }

    fn mut_target_system_for_reflect(&mut self) -> &mut u32 {
        &mut self.target_system
    }

    // uint32 target_component = 2;

    pub fn clear_target_component(&mut self) {
        self.target_component = 0;
    }

    // Param is passed by value, moved
    pub fn set_target_component(&mut self, v: u32) {
        self.target_component = v;
    }

    pub fn get_target_component(&self) -> u32 {
        self.target_component
    }

    fn get_target_component_for_reflect(&self) -> &u32 {
        &self.target_component
    }

    fn mut_target_component_for_reflect(&mut self) -> &mut u32 {
        &mut self.target_component
    }

    // uint32 seq = 3;

    pub fn clear_seq(&mut self) {
        self.seq = 0;
    }

    // Param is passed by value, moved
    pub fn set_seq(&mut self, v: u32) {
        self.seq = v;
    }

    pub fn get_seq(&self) -> u32 {
        self.seq
    }

    fn get_seq_for_reflect(&self) -> &u32 {
        &self.seq
    }

    fn mut_seq_for_reflect(&mut self) -> &mut u32 {
        &mut self.seq
    }

    // uint32 frame = 4;

    pub fn clear_frame(&mut self) {
        self.frame = 0;
    }

    // Param is passed by value, moved
    pub fn set_frame(&mut self, v: u32) {
        self.frame = v;
    }

    pub fn get_frame(&self) -> u32 {
        self.frame
    }

    fn get_frame_for_reflect(&self) -> &u32 {
        &self.frame
    }

    fn mut_frame_for_reflect(&mut self) -> &mut u32 {
        &mut self.frame
    }

    // uint32 command = 5;

    pub fn clear_command(&mut self) {
        self.command = 0;
    }

    // Param is passed by value, moved
    pub fn set_command(&mut self, v: u32) {
        self.command = v;
    }

    pub fn get_command(&self) -> u32 {
        self.command
    }

    fn get_command_for_reflect(&self) -> &u32 {
        &self.command
    }

    fn mut_command_for_reflect(&mut self) -> &mut u32 {
        &mut self.command
    }

    // double param_1 = 6;

    pub fn clear_param_1(&mut self) {
        self.param_1 = 0.;
    }

    // Param is passed by value, moved
    pub fn set_param_1(&mut self, v: f64) {
        self.param_1 = v;
    }

    pub fn get_param_1(&self) -> f64 {
        self.param_1
    }

    fn get_param_1_for_reflect(&self) -> &f64 {
        &self.param_1
    }

    fn mut_param_1_for_reflect(&mut self) -> &mut f64 {
        &mut self.param_1
    }

    // double param_2 = 7;

    pub fn clear_param_2(&mut self) {
        self.param_2 = 0.;
    }

    // Param is passed by value, moved
    pub fn set_param_2(&mut self, v: f64) {
        self.param_2 = v;
    }

    pub fn get_param_2(&self) -> f64 {
        self.param_2
    }

    fn get_param_2_for_reflect(&self) -> &f64 {
        &self.param_2
    }

    fn mut_param_2_for_reflect(&mut self) -> &mut f64 {
        &mut self.param_2
    }

    // double param_3 = 8;

    pub fn clear_param_3(&mut self) {
        self.param_3 = 0.;
    }

    // Param is passed by value, moved
    pub fn set_param_3(&mut self, v: f64) {
        self.param_3 = v;
    }

    pub fn get_param_3(&self) -> f64 {
        self.param_3
    }

    fn get_param_3_for_reflect(&self) -> &f64 {
        &self.param_3
    }

    fn mut_param_3_for_reflect(&mut self) -> &mut f64 {
        &mut self.param_3
    }

    // double param_4 = 9;

    pub fn clear_param_4(&mut self) {
        self.param_4 = 0.;
    }

    // Param is passed by value, moved
    pub fn set_param_4(&mut self, v: f64) {
        self.param_4 = v;
    }

    pub fn get_param_4(&self) -> f64 {
        self.param_4
    }

    fn get_param_4_for_reflect(&self) -> &f64 {
        &self.param_4
    }

    fn mut_param_4_for_reflect(&mut self) -> &mut f64 {
        &mut self.param_4
    }

    // double param_5 = 10;

    pub fn clear_param_5(&mut self) {
        self.param_5 = 0.;
    }

    // Param is passed by value, moved
    pub fn set_param_5(&mut self, v: f64) {
        self.param_5 = v;
    }

    pub fn get_param_5(&self) -> f64 {
        self.param_5
    }

    fn get_param_5_for_reflect(&self) -> &f64 {
        &self.param_5
    }

    fn mut_param_5_for_reflect(&mut self) -> &mut f64 {
        &mut self.param_5
    }

    // double param_6 = 11;

    pub fn clear_param_6(&mut self) {
        self.param_6 = 0.;
    }

    // Param is passed by value, moved
    pub fn set_param_6(&mut self, v: f64) {
        self.param_6 = v;
    }

    pub fn get_param_6(&self) -> f64 {
        self.param_6
    }

    fn get_param_6_for_reflect(&self) -> &f64 {
        &self.param_6
    }

    fn mut_param_6_for_reflect(&mut self) -> &mut f64 {
        &mut self.param_6
    }

    // double param_7 = 12;

    pub fn clear_param_7(&mut self) {
        self.param_7 = 0.;
    }

    // Param is passed by value, moved
    pub fn set_param_7(&mut self, v: f64) {
        self.param_7 = v;
    }

    pub fn get_param_7(&self) -> f64 {
        self.param_7
    }

    fn get_param_7_for_reflect(&self) -> &f64 {
        &self.param_7
    }

    fn mut_param_7_for_reflect(&mut self) -> &mut f64 {
        &mut self.param_7
    }
}

impl ::protobuf::Message for RawMission_Command {
    fn is_initialized(&self) -> bool {
        true
    }

    fn merge_from(&mut self, is: &mut ::protobuf::CodedInputStream) -> ::protobuf::ProtobufResult<()> {
        while !is.eof()? {
            let (field_number, wire_type) = is.read_tag_unpack()?;
            match field_number {
                1 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_uint32()?;
                    self.target_system = tmp;
                },
                2 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_uint32()?;
                    self.target_component = tmp;
                },
                3 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_uint32()?;
                    self.seq = tmp;
                },
                4 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_uint32()?;
                    self.frame = tmp;
                },
                5 => {
                    if wire_type != ::protobuf::wire_format::WireTypeVarint {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_uint32()?;
                    self.command = tmp;
                },
                6 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.param_1 = tmp;
                },
                7 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.param_2 = tmp;
                },
                8 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.param_3 = tmp;
                },
                9 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.param_4 = tmp;
                },
                10 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.param_5 = tmp;
                },
                11 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.param_6 = tmp;
                },
                12 => {
                    if wire_type != ::protobuf::wire_format::WireTypeFixed64 {
                        return ::std::result::Result::Err(::protobuf::rt::unexpected_wire_type(wire_type));
                    }
                    let tmp = is.read_double()?;
                    self.param_7 = tmp;
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
        if self.target_system != 0 {
            my_size += ::protobuf::rt::value_size(1, self.target_system, ::protobuf::wire_format::WireTypeVarint);
        }
        if self.target_component != 0 {
            my_size += ::protobuf::rt::value_size(2, self.target_component, ::protobuf::wire_format::WireTypeVarint);
        }
        if self.seq != 0 {
            my_size += ::protobuf::rt::value_size(3, self.seq, ::protobuf::wire_format::WireTypeVarint);
        }
        if self.frame != 0 {
            my_size += ::protobuf::rt::value_size(4, self.frame, ::protobuf::wire_format::WireTypeVarint);
        }
        if self.command != 0 {
            my_size += ::protobuf::rt::value_size(5, self.command, ::protobuf::wire_format::WireTypeVarint);
        }
        if self.param_1 != 0. {
            my_size += 9;
        }
        if self.param_2 != 0. {
            my_size += 9;
        }
        if self.param_3 != 0. {
            my_size += 9;
        }
        if self.param_4 != 0. {
            my_size += 9;
        }
        if self.param_5 != 0. {
            my_size += 9;
        }
        if self.param_6 != 0. {
            my_size += 9;
        }
        if self.param_7 != 0. {
            my_size += 9;
        }
        my_size += ::protobuf::rt::unknown_fields_size(self.get_unknown_fields());
        self.cached_size.set(my_size);
        my_size
    }

    fn write_to_with_cached_sizes(&self, os: &mut ::protobuf::CodedOutputStream) -> ::protobuf::ProtobufResult<()> {
        if self.target_system != 0 {
            os.write_uint32(1, self.target_system)?;
        }
        if self.target_component != 0 {
            os.write_uint32(2, self.target_component)?;
        }
        if self.seq != 0 {
            os.write_uint32(3, self.seq)?;
        }
        if self.frame != 0 {
            os.write_uint32(4, self.frame)?;
        }
        if self.command != 0 {
            os.write_uint32(5, self.command)?;
        }
        if self.param_1 != 0. {
            os.write_double(6, self.param_1)?;
        }
        if self.param_2 != 0. {
            os.write_double(7, self.param_2)?;
        }
        if self.param_3 != 0. {
            os.write_double(8, self.param_3)?;
        }
        if self.param_4 != 0. {
            os.write_double(9, self.param_4)?;
        }
        if self.param_5 != 0. {
            os.write_double(10, self.param_5)?;
        }
        if self.param_6 != 0. {
            os.write_double(11, self.param_6)?;
        }
        if self.param_7 != 0. {
            os.write_double(12, self.param_7)?;
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

impl ::protobuf::MessageStatic for RawMission_Command {
    fn new() -> RawMission_Command {
        RawMission_Command::new()
    }

    fn descriptor_static(_: ::std::option::Option<RawMission_Command>) -> &'static ::protobuf::reflect::MessageDescriptor {
        static mut descriptor: ::protobuf::lazy::Lazy<::protobuf::reflect::MessageDescriptor> = ::protobuf::lazy::Lazy {
            lock: ::protobuf::lazy::ONCE_INIT,
            ptr: 0 as *const ::protobuf::reflect::MessageDescriptor,
        };
        unsafe {
            descriptor.get(|| {
                let mut fields = ::std::vec::Vec::new();
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeUint32>(
                    "target_system",
                    RawMission_Command::get_target_system_for_reflect,
                    RawMission_Command::mut_target_system_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeUint32>(
                    "target_component",
                    RawMission_Command::get_target_component_for_reflect,
                    RawMission_Command::mut_target_component_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeUint32>(
                    "seq",
                    RawMission_Command::get_seq_for_reflect,
                    RawMission_Command::mut_seq_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeUint32>(
                    "frame",
                    RawMission_Command::get_frame_for_reflect,
                    RawMission_Command::mut_frame_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeUint32>(
                    "command",
                    RawMission_Command::get_command_for_reflect,
                    RawMission_Command::mut_command_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "param_1",
                    RawMission_Command::get_param_1_for_reflect,
                    RawMission_Command::mut_param_1_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "param_2",
                    RawMission_Command::get_param_2_for_reflect,
                    RawMission_Command::mut_param_2_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "param_3",
                    RawMission_Command::get_param_3_for_reflect,
                    RawMission_Command::mut_param_3_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "param_4",
                    RawMission_Command::get_param_4_for_reflect,
                    RawMission_Command::mut_param_4_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "param_5",
                    RawMission_Command::get_param_5_for_reflect,
                    RawMission_Command::mut_param_5_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "param_6",
                    RawMission_Command::get_param_6_for_reflect,
                    RawMission_Command::mut_param_6_for_reflect,
                ));
                fields.push(::protobuf::reflect::accessor::make_simple_field_accessor::<_, ::protobuf::types::ProtobufTypeDouble>(
                    "param_7",
                    RawMission_Command::get_param_7_for_reflect,
                    RawMission_Command::mut_param_7_for_reflect,
                ));
                ::protobuf::reflect::MessageDescriptor::new::<RawMission_Command>(
                    "RawMission_Command",
                    fields,
                    file_descriptor_proto()
                )
            })
        }
    }
}

impl ::protobuf::Clear for RawMission_Command {
    fn clear(&mut self) {
        self.clear_target_system();
        self.clear_target_component();
        self.clear_seq();
        self.clear_frame();
        self.clear_command();
        self.clear_param_1();
        self.clear_param_2();
        self.clear_param_3();
        self.clear_param_4();
        self.clear_param_5();
        self.clear_param_6();
        self.clear_param_7();
        self.unknown_fields.clear();
    }
}

impl ::std::fmt::Debug for RawMission_Command {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        ::protobuf::text_format::fmt(self, f)
    }
}

impl ::protobuf::reflect::ProtobufValue for RawMission_Command {
    fn as_ref(&self) -> ::protobuf::reflect::ProtobufValueRef {
        ::protobuf::reflect::ProtobufValueRef::Message(self)
    }
}

static file_descriptor_proto_data: &'static [u8] = b"\
    \n\x0ftelemetry.proto\x12\ttelemetry\"\x93\x01\n\x0bCameraTelem\x12\x12\
    \n\x04time\x18\x01\x20\x01(\x01R\x04time\x12\x10\n\x03lat\x18\x02\x20\
    \x01(\x01R\x03lat\x12\x10\n\x03lon\x18\x03\x20\x01(\x01R\x03lon\x12\x10\
    \n\x03alt\x18\x04\x20\x01(\x01R\x03alt\x12\x10\n\x03yaw\x18\x05\x20\x01(\
    \x01R\x03yaw\x12\x14\n\x05pitch\x18\x06\x20\x01(\x01R\x05pitch\x12\x12\n\
    \x04roll\x18\x07\x20\x01(\x01R\x04roll\"\xbc\x03\n\nRawMission\x12\x12\n\
    \x04time\x18\x01\x20\x01(\x01R\x04time\x12\x12\n\x04next\x18\x02\x20\x01\
    (\rR\x04next\x129\n\x08commands\x18\x03\x20\x03(\x0b2\x1d.telemetry.RawM\
    ission.CommandR\x08commands\x1a\xca\x02\n\x07Command\x12#\n\rtarget_syst\
    em\x18\x01\x20\x01(\rR\x0ctargetSystem\x12)\n\x10target_component\x18\
    \x02\x20\x01(\rR\x0ftargetComponent\x12\x10\n\x03seq\x18\x03\x20\x01(\rR\
    \x03seq\x12\x14\n\x05frame\x18\x04\x20\x01(\rR\x05frame\x12\x18\n\x07com\
    mand\x18\x05\x20\x01(\rR\x07command\x12\x17\n\x07param_1\x18\x06\x20\x01\
    (\x01R\x06param1\x12\x17\n\x07param_2\x18\x07\x20\x01(\x01R\x06param2\
    \x12\x17\n\x07param_3\x18\x08\x20\x01(\x01R\x06param3\x12\x17\n\x07param\
    _4\x18\t\x20\x01(\x01R\x06param4\x12\x17\n\x07param_5\x18\n\x20\x01(\x01\
    R\x06param5\x12\x17\n\x07param_6\x18\x0b\x20\x01(\x01R\x06param6\x12\x17\
    \n\x07param_7\x18\x0c\x20\x01(\x01R\x06param7J\x8e\x13\n\x06\x12\x04\x0c\
    \07\x01\n\x9e\x02\n\x01\x0c\x12\x03\x0c\0\x122\x93\x02\n\x20Telemetry\
    \x20message\x20definitions\n\x20\n\x20Note\x20that\x20all\x20units\x20wi\
    ll\x20be\x20in\x20meters,\x20meters/second,\x20seconds,\n\x20degrees,\
    \x20etc.\x20unless\x20otherwise\x20noted.\n\x20\n\x20Time\x20is\x20in\
    \x20seconds\x20from\x201970\x20epoch.\n\n\x20Yaw\x20is\x20in\x20the\x20r\
    ange\x20[0,\x20360)\x20degrees\x20and\x20lat,\x20lon,\x20pitch\x20and\
    \x20roll\n\x20are\x20in\x20the\x20range\x20(-180,\x20180].\n\n\x08\n\x01\
    \x02\x12\x03\x0e\x08\x11\n\x1d\n\x02\x04\0\x12\x04\x11\0\x1c\x01\x1a\x11\
    \x20Camera\x20telemtry\n\n\n\n\x03\x04\0\x01\x12\x03\x11\x08\x13\n\x0b\n\
    \x04\x04\0\x02\0\x12\x03\x12\x04\x14\n\r\n\x05\x04\0\x02\0\x04\x12\x04\
    \x12\x04\x11\x15\n\x0c\n\x05\x04\0\x02\0\x05\x12\x03\x12\x04\n\n\x0c\n\
    \x05\x04\0\x02\0\x01\x12\x03\x12\x0b\x0f\n\x0c\n\x05\x04\0\x02\0\x03\x12\
    \x03\x12\x12\x13\n\x0b\n\x04\x04\0\x02\x01\x12\x03\x13\x04\x13\n\r\n\x05\
    \x04\0\x02\x01\x04\x12\x04\x13\x04\x12\x14\n\x0c\n\x05\x04\0\x02\x01\x05\
    \x12\x03\x13\x04\n\n\x0c\n\x05\x04\0\x02\x01\x01\x12\x03\x13\x0b\x0e\n\
    \x0c\n\x05\x04\0\x02\x01\x03\x12\x03\x13\x11\x12\n\x0b\n\x04\x04\0\x02\
    \x02\x12\x03\x14\x04\x13\n\r\n\x05\x04\0\x02\x02\x04\x12\x04\x14\x04\x13\
    \x13\n\x0c\n\x05\x04\0\x02\x02\x05\x12\x03\x14\x04\n\n\x0c\n\x05\x04\0\
    \x02\x02\x01\x12\x03\x14\x0b\x0e\n\x0c\n\x05\x04\0\x02\x02\x03\x12\x03\
    \x14\x11\x12\n!\n\x04\x04\0\x02\x03\x12\x03\x16\x04\x13\x1a\x14\x20Relat\
    ive\x20to\x20ground\n\n\r\n\x05\x04\0\x02\x03\x04\x12\x04\x16\x04\x14\
    \x13\n\x0c\n\x05\x04\0\x02\x03\x05\x12\x03\x16\x04\n\n\x0c\n\x05\x04\0\
    \x02\x03\x01\x12\x03\x16\x0b\x0e\n\x0c\n\x05\x04\0\x02\x03\x03\x12\x03\
    \x16\x11\x12\n\x0b\n\x04\x04\0\x02\x04\x12\x03\x17\x04\x13\n\r\n\x05\x04\
    \0\x02\x04\x04\x12\x04\x17\x04\x16\x13\n\x0c\n\x05\x04\0\x02\x04\x05\x12\
    \x03\x17\x04\n\n\x0c\n\x05\x04\0\x02\x04\x01\x12\x03\x17\x0b\x0e\n\x0c\n\
    \x05\x04\0\x02\x04\x03\x12\x03\x17\x11\x12\nH\n\x04\x04\0\x02\x05\x12\
    \x03\x19\x04\x15\x1a;\x200\x20pitch\x20points\x20to\x20the\x20front\x20o\
    f\x20the\x20plane,\x20-90\x20points\x20down\n\n\r\n\x05\x04\0\x02\x05\
    \x04\x12\x04\x19\x04\x17\x13\n\x0c\n\x05\x04\0\x02\x05\x05\x12\x03\x19\
    \x04\n\n\x0c\n\x05\x04\0\x02\x05\x01\x12\x03\x19\x0b\x10\n\x0c\n\x05\x04\
    \0\x02\x05\x03\x12\x03\x19\x13\x14\n9\n\x04\x04\0\x02\x06\x12\x03\x1b\
    \x04\x14\x1a,\x200\x20roll\x20points\x20down,\x2090\x20points\x20to\x20t\
    he\x20right\n\n\r\n\x05\x04\0\x02\x06\x04\x12\x04\x1b\x04\x19\x15\n\x0c\
    \n\x05\x04\0\x02\x06\x05\x12\x03\x1b\x04\n\n\x0c\n\x05\x04\0\x02\x06\x01\
    \x12\x03\x1b\x0b\x0f\n\x0c\n\x05\x04\0\x02\x06\x03\x12\x03\x1b\x12\x13\n\
    ?\n\x02\x04\x01\x12\x04\x1f\07\x01\x1a3\x20This\x20has\x20direct\x20mapp\
    ings\x20to\x20the\x20Mavlink\x20protocol.\n\n\n\n\x03\x04\x01\x01\x12\
    \x03\x1f\x08\x12\n\x0c\n\x04\x04\x01\x03\0\x12\x04\x20\x042\x05\n\x0c\n\
    \x05\x04\x01\x03\0\x01\x12\x03\x20\x0c\x13\n\r\n\x06\x04\x01\x03\0\x02\0\
    \x12\x03!\x08!\n\x0f\n\x07\x04\x01\x03\0\x02\0\x04\x12\x04!\x08\x20\x15\
    \n\x0e\n\x07\x04\x01\x03\0\x02\0\x05\x12\x03!\x08\x0e\n\x0e\n\x07\x04\
    \x01\x03\0\x02\0\x01\x12\x03!\x0f\x1c\n\x0e\n\x07\x04\x01\x03\0\x02\0\
    \x03\x12\x03!\x1f\x20\n\r\n\x06\x04\x01\x03\0\x02\x01\x12\x03\"\x08$\n\
    \x0f\n\x07\x04\x01\x03\0\x02\x01\x04\x12\x04\"\x08!!\n\x0e\n\x07\x04\x01\
    \x03\0\x02\x01\x05\x12\x03\"\x08\x0e\n\x0e\n\x07\x04\x01\x03\0\x02\x01\
    \x01\x12\x03\"\x0f\x1f\n\x0e\n\x07\x04\x01\x03\0\x02\x01\x03\x12\x03\"\"\
    #\nO\n\x06\x04\x01\x03\0\x02\x02\x12\x03%\x08\x17\x1a@\x20Order\x20of\
    \x20this\x20Command,\x20only\x20needed\x20when\x20reading\x20a\n\x20RawM\
    ission.\n\n\x0f\n\x07\x04\x01\x03\0\x02\x02\x04\x12\x04%\x08\"$\n\x0e\n\
    \x07\x04\x01\x03\0\x02\x02\x05\x12\x03%\x08\x0e\n\x0e\n\x07\x04\x01\x03\
    \0\x02\x02\x01\x12\x03%\x0f\x12\n\x0e\n\x07\x04\x01\x03\0\x02\x02\x03\
    \x12\x03%\x15\x16\nY\n\x06\x04\x01\x03\0\x02\x03\x12\x03(\x08\x19\x1aJ\
    \x20Frame\x20and\x20Command\x20use\x20the\x20int\x20number\x20specified\
    \x20in\x20the\n\x20Mavlink\x20XML\x20file.\n\n\x0f\n\x07\x04\x01\x03\0\
    \x02\x03\x04\x12\x04(\x08%\x17\n\x0e\n\x07\x04\x01\x03\0\x02\x03\x05\x12\
    \x03(\x08\x0e\n\x0e\n\x07\x04\x01\x03\0\x02\x03\x01\x12\x03(\x0f\x14\n\
    \x0e\n\x07\x04\x01\x03\0\x02\x03\x03\x12\x03(\x17\x18\n\r\n\x06\x04\x01\
    \x03\0\x02\x04\x12\x03)\x08\x1b\n\x0f\n\x07\x04\x01\x03\0\x02\x04\x04\
    \x12\x04)\x08(\x19\n\x0e\n\x07\x04\x01\x03\0\x02\x04\x05\x12\x03)\x08\
    \x0e\n\x0e\n\x07\x04\x01\x03\0\x02\x04\x01\x12\x03)\x0f\x16\n\x0e\n\x07\
    \x04\x01\x03\0\x02\x04\x03\x12\x03)\x19\x1a\nJ\n\x06\x04\x01\x03\0\x02\
    \x05\x12\x03+\x08\x1b\x1a;\x20These\x20parameters\x20correspond\x20to\
    \x20the\x20Mavlink\x20command\x20enums.\n\n\x0f\n\x07\x04\x01\x03\0\x02\
    \x05\x04\x12\x04+\x08)\x1b\n\x0e\n\x07\x04\x01\x03\0\x02\x05\x05\x12\x03\
    +\x08\x0e\n\x0e\n\x07\x04\x01\x03\0\x02\x05\x01\x12\x03+\x0f\x16\n\x0e\n\
    \x07\x04\x01\x03\0\x02\x05\x03\x12\x03+\x19\x1a\n\r\n\x06\x04\x01\x03\0\
    \x02\x06\x12\x03,\x08\x1b\n\x0f\n\x07\x04\x01\x03\0\x02\x06\x04\x12\x04,\
    \x08+\x1b\n\x0e\n\x07\x04\x01\x03\0\x02\x06\x05\x12\x03,\x08\x0e\n\x0e\n\
    \x07\x04\x01\x03\0\x02\x06\x01\x12\x03,\x0f\x16\n\x0e\n\x07\x04\x01\x03\
    \0\x02\x06\x03\x12\x03,\x19\x1a\n\r\n\x06\x04\x01\x03\0\x02\x07\x12\x03-\
    \x08\x1b\n\x0f\n\x07\x04\x01\x03\0\x02\x07\x04\x12\x04-\x08,\x1b\n\x0e\n\
    \x07\x04\x01\x03\0\x02\x07\x05\x12\x03-\x08\x0e\n\x0e\n\x07\x04\x01\x03\
    \0\x02\x07\x01\x12\x03-\x0f\x16\n\x0e\n\x07\x04\x01\x03\0\x02\x07\x03\
    \x12\x03-\x19\x1a\n\r\n\x06\x04\x01\x03\0\x02\x08\x12\x03.\x08\x1b\n\x0f\
    \n\x07\x04\x01\x03\0\x02\x08\x04\x12\x04.\x08-\x1b\n\x0e\n\x07\x04\x01\
    \x03\0\x02\x08\x05\x12\x03.\x08\x0e\n\x0e\n\x07\x04\x01\x03\0\x02\x08\
    \x01\x12\x03.\x0f\x16\n\x0e\n\x07\x04\x01\x03\0\x02\x08\x03\x12\x03.\x19\
    \x1a\n\r\n\x06\x04\x01\x03\0\x02\t\x12\x03/\x08\x1c\n\x0f\n\x07\x04\x01\
    \x03\0\x02\t\x04\x12\x04/\x08.\x1b\n\x0e\n\x07\x04\x01\x03\0\x02\t\x05\
    \x12\x03/\x08\x0e\n\x0e\n\x07\x04\x01\x03\0\x02\t\x01\x12\x03/\x0f\x16\n\
    \x0e\n\x07\x04\x01\x03\0\x02\t\x03\x12\x03/\x19\x1b\n\r\n\x06\x04\x01\
    \x03\0\x02\n\x12\x030\x08\x1c\n\x0f\n\x07\x04\x01\x03\0\x02\n\x04\x12\
    \x040\x08/\x1c\n\x0e\n\x07\x04\x01\x03\0\x02\n\x05\x12\x030\x08\x0e\n\
    \x0e\n\x07\x04\x01\x03\0\x02\n\x01\x12\x030\x0f\x16\n\x0e\n\x07\x04\x01\
    \x03\0\x02\n\x03\x12\x030\x19\x1b\n\r\n\x06\x04\x01\x03\0\x02\x0b\x12\
    \x031\x08\x1c\n\x0f\n\x07\x04\x01\x03\0\x02\x0b\x04\x12\x041\x080\x1c\n\
    \x0e\n\x07\x04\x01\x03\0\x02\x0b\x05\x12\x031\x08\x0e\n\x0e\n\x07\x04\
    \x01\x03\0\x02\x0b\x01\x12\x031\x0f\x16\n\x0e\n\x07\x04\x01\x03\0\x02\
    \x0b\x03\x12\x031\x19\x1b\n\x0b\n\x04\x04\x01\x02\0\x12\x034\x04\x14\n\r\
    \n\x05\x04\x01\x02\0\x04\x12\x044\x042\x05\n\x0c\n\x05\x04\x01\x02\0\x05\
    \x12\x034\x04\n\n\x0c\n\x05\x04\x01\x02\0\x01\x12\x034\x0b\x0f\n\x0c\n\
    \x05\x04\x01\x02\0\x03\x12\x034\x12\x13\n\x0b\n\x04\x04\x01\x02\x01\x12\
    \x035\x04\x14\n\r\n\x05\x04\x01\x02\x01\x04\x12\x045\x044\x14\n\x0c\n\
    \x05\x04\x01\x02\x01\x05\x12\x035\x04\n\n\x0c\n\x05\x04\x01\x02\x01\x01\
    \x12\x035\x0b\x0f\n\x0c\n\x05\x04\x01\x02\x01\x03\x12\x035\x12\x13\n\x0b\
    \n\x04\x04\x01\x02\x02\x12\x036\x04\"\n\x0c\n\x05\x04\x01\x02\x02\x04\
    \x12\x036\x04\x0c\n\x0c\n\x05\x04\x01\x02\x02\x06\x12\x036\r\x14\n\x0c\n\
    \x05\x04\x01\x02\x02\x01\x12\x036\x15\x1d\n\x0c\n\x05\x04\x01\x02\x02\
    \x03\x12\x036\x20!b\x06proto3\
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
